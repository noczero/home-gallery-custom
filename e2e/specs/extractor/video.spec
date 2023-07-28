# Extractor: Video

Tags: extractor, video

* Start mock server
* Init config
* Set test env

## Custom video size

Test custom video preview settings such as preview size, frame rate, portrait video

* Set config "extractor.video.previewSize" to "640"
* Set config "extractor.video.frameRate" to "25"
* Add file "extractor/video/IMG_20220908_180939.mp4"
* Create index
* Extract files
* Storage has entry "video-preview-640.mp4" for "5925b60"
* Storage entry "video-preview-640.mp4" for "5925b60" has exif value "640" for "ImageWidth"
* Storage entry "video-preview-640.mp4" for "5925b60" has exif value "1138" for "ImageHeight"
* Storage entry "video-preview-640.mp4" for "5925b60" has exif value "25" for "VideoFrameRate"

___
* Stop server