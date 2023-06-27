<template>
  <div class="VideoRecorder">
    <video
      ref="video"
      :controls="false"
      width="340px"
      muted
      height="auto"
      class="my-video"
      :webkit-playsinline="true"
      :playsinline="true"
    ></video>
  </div>
</template>

<script>
import { Dialog } from "vant";
var stopRecordCallback;
export default {
  name: "VideoRecorder",
  data() {
    return {
      mediaRecorder: null,
      mediaStream: null,
      recorderFile: null,
      chunks: [],
    };
  },
  mounted() {
    this.openCamera(); //摄像头初始化
  },
  destroyed() {
    this.closeBtn();
  },
  methods: {
    //开始录制
    start() {
      this.mediaRecorder.start();
    },
    //停止录制
    stop() {
      this.stopRecord(() => {
        Dialog.alert({
          message: "录制成功!",
          confirmButtonColor: "#fda21d",
        }).then(() => {
          this.send();
        });
      });
    },
    //重新录制
    reStart() {
      this.mediaRecorder.start();
    },
    // 停止录制
    stopRecord(callback) {
      stopRecordCallback = callback;
      // 终止录制器
      this.mediaRecorder.stop();
      // 关闭媒体流
      this.closeBtn();
    },
    closeBtn() {
      this.closeStream(this.mediaStream);
    },

    openCamera() {
      var constraints = {
        audio: true,
        video: {
          // width: { min: 1024, ideal: 1280, max: 1920 },
          // height: { min: 776, ideal: 720, max: 1080 },
          deviceId: "default",
          facingMode: "user", //调用前置摄像头
        },
      };
      this.getUserMedia(constraints, (err, stream) => {
        if (err) {
          this.$emit("error", err);
          throw err;
        } else {
          // 通过 MediaRecorder 记录获取到的媒体流
          console.log();
          const video = this.$refs.video;
          this.mediaRecorder = new MediaRecorder(stream);
          this.mediaStream = stream;
          (this.chunks = []), (video.srcObject = stream);
          video.play();

          this.mediaRecorder.ondataavailable = (e) => {
            this.mediaRecorder.blobs.push(e.data);
            this.chunks.push(e.data);
          };
          this.mediaRecorder.blobs = [];

          this.mediaRecorder.onstop = (e) => {
            this.recorderFile = new Blob(this.chunks, {
              type: this.mediaRecorder.mimeType,
            });
            this.chunks = [];
            if (null != stopRecordCallback) {
              stopRecordCallback();
            }
          };
        }
      });
    },

    /**
     * 获取用户媒体设备(处理兼容的问题)
     * @param videoEnable {boolean} - 是否启用摄像头
     * @param audioEnable {boolean} - 是否启用麦克风
     * @param callback {Function} - 处理回调
     */
    getUserMedia(constraints, callback) {
      navigator.getUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia ||
        window.getUserMedia;
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia(constraints)
          .then(function (stream) {
            callback(false, stream);
          })
          ["catch"](function (err) {
            callback(err);
          });
      } else if (navigator.getUserMedia) {
        navigator.getUserMedia(
          constraints,
          function (stream) {
            callback(false, stream);
          },
          function (err) {
            callback(err);
          }
        );
      } else {
        callback(new Error("Not support userMedia"));
      }
    },

    /**
     * 关闭媒体流
     * @param stream {MediaStream} - 需要关闭的流
     */
    closeStream(stream) {
      if (!stream) return;
      if (typeof stream.stop === "function") {
        stream.stop();
      } else {
        let trackList = [stream.getAudioTracks(), stream.getVideoTracks()];

        for (let i = 0; i < trackList.length; i++) {
          let tracks = trackList[i];
          if (tracks && tracks.length > 0) {
            for (let j = 0; j < tracks.length; j++) {
              let track = tracks[j];
              if (typeof track.stop === "function") {
                track.stop();
              }
            }
          }
        }
      }
    },

    saver() {
      var file = new File(
        [this.recorderFile],
        "msr-" + new Date().toISOString().replace(/:|\./g, "-") + ".mp4",
        {
          type: "video/mp4",
        }
      );
      FileSaver.saveAs(file);
    },

    send() {
      //格式： subject-张大宝-宣导页视频-20221214172357.mp4
      let time = new Date().getTime();
      let localUrl = this.blobToUrl(this.recorderFile);
      let fileName = `subject-宣导页视频-${time}.mp4`; // 可自定义文件名称
      var file = new File([this.recorderFile], fileName, {
        type: "video/mp4",
      });
      console.log("fileName", fileName);
      console.log("file", file);
      var formData = {};
      formData.fileName = fileName;
      formData.file = file;
      console.log("===176===录制文件", formData);
      const recorder = {
        formData: formData,
        localUrl: localUrl,
      };
      this.$emit("success", recorder);
    },
    // blob 转化url
    blobToUrl(blob) {
      let url = window.URL.createObjectURL(blob);
      return url;
    },
  },
};
</script>

<style scoped>
.VideoRecorder {
  position: relative;
}

.VideoRecorder .my-video {
  position: relative;
  left: -44px;
}

.VideoRecorder .my-video::-webkit-media-controls-enclosure {
  display: none;
}
</style>