const getVideoStream = (entry) => {
  const streams = entry.meta?.ffprobe?.streams
  return streams?.find(stream => stream.codec_type == 'video')
}

const isPortraitVideo = (video) => {
  const displayMatrix = video?.side_data_list?.find(sideData => sideData.side_data_type == 'Display Matrix')
  return [-90, 90].includes(displayMatrix?.rotation)
}

const fixRotatedScale = (isPortrait) => {
  if (!isPortrait) {
    return v => v
  }
  return v => {
    if (!v.match(/scale=/)) {
      return v
    } else if (v.match(/ /)) {
      return v.split(' ').map(fixRotatedScale(isPortrait)).join(' ')
    }
    // example format -2:'min(720,ih)'
    const match = v.match(/scale=([^:]+):(\'[^']+\'|[^,]+)/)
    if (!match) {
      return v
    }
    return v.substring(0, match.index) +
      `scale=${match[2].replace('ih', 'iw')}:${match[1].replace('iw', 'ih')}` +
      v.substring(match.index + match[0].length)
  }
}

const defaultFfmpegOptions = {
  videoEncoder: 'libx264',
  frameRate: 30,
  maxVideoBitRate: 4000,
  preset: 'slow',
  profile: 'baseline',
  level: '3.0',
  ext: 'mp4'
}

function getFfmpegArgs(entry, options) {
  const isPortrait = isPortraitVideo(getVideoStream(entry))

  const scale = options.scale ? options.scale : `-2:\'min(${options.previewSize || 720},ih)\'`
  const ffmpegOptions = {...defaultFfmpegOptions, ...options, scale}

  const ffmpegArgs = Array.isArray(options.customFfmpegArgs) ? options.customFfmpegArgs : [
    `-c:v ${ffmpegOptions.videoEncoder}`,
    '-c:a aac',
    `-r ${ffmpegOptions.frameRate}`,
    `-vf scale=${ffmpegOptions.scale},format=yuv420p`,
    `-preset ${ffmpegOptions.preset}`,
    '-tune film',
    `-profile:v ${ffmpegOptions.profile}`,
    `-level:v ${typeof ffmpegOptions.level == 'number' ? ffmpegOptions.level.toFixed(1) : ffmpegOptions.level}`,
    `-maxrate ${ffmpegOptions.maxVideoBitRate}k`,
    `-bufsize ${2 * ffmpegOptions.maxVideoBitRate}k`,
    '-movflags +faststart',
    '-b:a 128k',
    `-f ${ffmpegOptions.ext}`
  ]

  return ffmpegArgs.map(fixRotatedScale(isPortrait))
}

const getVideoOptions = (extractor) => {
  const { ffprobePath, ffmpegPath } = extractor
  const options = extractor?.video

  const videoSuffix = `video-preview-${options?.previewSize || 720}.${options?.ext || 'mp4'}`;
  return {...options, videoSuffix, ffprobePath, ffmpegPath }
}

module.exports = {
  getVideoStream,
  isPortraitVideo,
  fixRotatedScale,
  getFfmpegArgs,
  getVideoOptions
}