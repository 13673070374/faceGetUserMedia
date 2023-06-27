<!--
 getUserMedia  唤起视频流拍摄视频 兼容性较差
-->
<template>
  <div>
    <video
      id="video"
      ref="videos"
      style="width: 100%; height: 70vh"
      :controls="false"
      x5-video-player-type="h5"
      muted
      autoplay
      playsinline
    ></video>
    <!-- <video
      style="width: 100%; height: 300px"
      id="videosreplay"
      src=""
      ref="videosreplay"
    ></video> -->
    <div class="tool">
      <div class="record-time">
        <span v-show="recordtype == 'ING'" >{{ recordtime / 1000 | digitFormat }}</span>
      </div>
      <div class="btns">
        <van-button
          type="primary"
          class="btn"
          v-show="recordtype == 'BEGIN'"
          @click="record()"
          >开始录制</van-button
        >
        <van-button
          type="primary"
          class="btn"
          v-show="recordtype == 'RELOAD'"
          @click="reload()"
        >
          重新录制</van-button
        >
        <van-button
          type="danger"
          v-show="recordtype == 'ING'"
          class="btn"
          @click="record()"
          >结束录制</van-button
        >
        <van-button
          type="info"
          v-show="recordtype == 'RELOAD'"
          class="btn"
          @click="submit()"
          >上传视频</van-button
        >
        <van-button
          type="danger"
          v-show="recordtype == 'RELOAD'"
          class="btn"
          @click="cancle"
          >取消录制</van-button
        >
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "Test",
  data() {
    return {
      progress: 0,
      replayVideo: false,
      recordtype: "BEGIN",
      showReplay: true,
      timer: 0,
      recordtime: 0,
      second: 0,
      minute: 0,
      hour: 0,
      playtime: 0,
      playtimer: 0,
      yy_score: 0,
      cnt_sum: 0,
      ansMaxTime: 0,
      ansBeginTime: 0,
      ansMaxBeginTime: 0,

      startTime: null,
      mediaRecorder: null,
      mediaStream: null,
      stopRecordCallback: null,
      recorderFile: null,
    };
  },
  filters: {
    digitFormat(time) {
      if (!time) {
        return "00:00";
      }
      var minute = Math.floor(time / 60);
      var second = time % 60;
      var hour = Math.floor(minute / 60);
      minute = minute % 60;
      if (hour < 10) {
        hour = "0" + hour;
      }
      if (minute < 10) {
        minute = "0" + minute;
      }
      if (second < 10) {
        second = "0" + second;
      }
      return minute + ":" + second;
    },
  },
  methods: {
    // 调用摄像头
    callCamera() {
      // if (this.mediaRecorder) {
      //   alert("stop stop");
      //   this.stopRecord();
      // }

      let _this = this;
      MediaUtils.getUserMedia(
        {
          facingMode: "user", // 优先调前置摄像头
        },
        true,
        function (err, stream) {
          if (err) {
            throw err;
          } else {
            // 通过 MediaRecorder 记录获取到的媒体流
            const mimeType = "video/webm;codecs=vp8,opus";
            _this.mediaRecorder = new MediaRecorder(stream, {
              // mimeType: "video/webm;codecs=vp9",
              mimeType: mimeType,
            });
            _this.mediaStream = stream;
            let winURL = window.URL || window.webkitURL;
            if ("srcObject" in _this.$refs.videos) {
              _this.$refs.videos.srcObject = stream;
            } else {
              _this.$refs.videos.src = winURL.createObjectURL(stream);
            }
            _this.$refs.videos.onloadedmetadata = (e) => {
              // 播放视频
              _this.$refs.videos.play();
            };
            var chunks = [];
            // var video = _this.$refs.videos;
            // video["srcObject"] = stream;
            // video.play(); // 播放实时画面
            _this.mediaRecorder.ondataavailable = function (e) {
              _this.mediaRecorder.blobs.push(e.data);
              chunks.push(e.data);
            };
            _this.mediaRecorder.blobs = [];

            _this.mediaRecorder.onstop = async () => {
              // _this.recorderFile = await fixWebmDuration(new Blob(chunks, { type: mimeType }));
              _this.recorderFile = await new Blob(chunks, { type: mimeType });
              console.log(_this.recorderFile);
              // var url = URL.createObjectURL(this.recorderFile);
              // var videosreplay = _this.$refs.videosreplay;
              // videosreplay.setAttribute("src", url);
              // console.log("url", url);
              chunks = [];
              if (null != _this.stopRecordCallback) {
                _this.stopRecordCallback();
              }
            };
          }
        }
      );
    },
    record() {
      console.log("this.recordtype", this.recordtype);
      if (this.recordtype == "ING") {
        this.stopRecord(() => {
          console.log("结束录制");
          // this.toggleReplayVideo();
        });
      } else if (this.recordtype == "BEGIN") {
        console.log("开始录制");
        this.startAudio();
        this.mediaRecorder.start();
        this.startTime = Date.now();
        this.recordtype = "ING";
      }
    },

    reload() {
      this.recordtype = "BEGIN";
      this.callCamera();
    },

    // 取消录制，返回到上一级页面
    cancle() {
      this.$router.go(-1);
    },

    // 对录像时长进行记录
    startAudio() {
      this.timer = setInterval(() => {
        this.recordtime += 1000;
        if (this.recordtime == 1000000) {
          this.stopRecord();
        }
        this.second++;
        if (this.second >= 60) {
          this.second = 0;
          this.minute = this.minute + 1;
        }

        if (this.minute >= 60) {
          this.minute = 0;
          this.hour = this.hour + 1;
        }
        console.log(this.recordtime);
      }, 1000);
    },

    // 停止录像时终止录制器，关闭媒体流并清除时长记录定时器
    stopRecord(callback) {
      this.recordtype = "RELOAD";
      this.showReplay = true;
      this.stopRecordCallback = callback;
      clearInterval(this.timer);
      this.recordtime = 0;
      // 终止录制器
      this.mediaRecorder.stop();
      // 关闭媒体流
      if (this.mediaStream) {
        MediaUtils.closeStream(this.mediaStream);
      }
      // var videosreplay = this.$refs.videosreplay;
      // videosreplay.onended = () => {
      //   this.playtime = 0;
      //   this.replayVideo = false;
      //   clearInterval(this.playtimer);
      // };
      // videosreplay.onclick = () => {
      //   this.showReplay = !this.showReplay;
      // };
    },
    // 回放
    toggleReplayVideo() {
      console.log("播放中...");
      this.replayVideo = !this.replayVideo;
      this.showReplay = false;
      var videosreplay = this.$refs.videosreplay;
      if (this.replayVideo) {
        videosreplay.play().catch((err) => {
          this.$message.error(err.message);
          console.log(err);
        });
        this.playtimer = setInterval(() => {
          this.playtime += 1000;
        }, 1000);
      } else {
        videosreplay.pause();
        clearInterval(this.playtimer);
      }
    },
    // 下载视频
    download() {
      var url = URL.createObjectURL(this.recorderFile);
      console.log("URLLLLLL", url);
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.style.display = "none";
      a.href = url;
      if (this.fileName) {
        a.download = this.fileName + ".mp4";
      } else {
        a.download = new Date() + ".mp4";
      }
      a.click();
      window.URL.revokeObjectURL(url);
    },
    // 下载或上传
    submit() {
      let that = this;
      console.log(this.recorderFile);
      // 下载
      // this.download();
      let file = new File(
        [this.recorderFile],
        "msr-" + new Date().toISOString().replace(/:|\./g, "-") + ".mp4",
        {
          type: "video/mp4",
        }
      );
      let config = {
        headers: { "Content-Type": "multipart/form-data" },
      };
      console.log("file", file);

      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // base64编码格式
        let result = reader.result.replace(/^data:video\/\w+;base64,/, "");
        console.log("vido Base64 Result", result);
        // that.faceReco(result);
      };

      const formdata = new FormData();
      formdata.append("file", file);
      // 传给后端
      // axios.post('/video', formdata, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },) //请求头要为表单
      //   .then(response => {
      //     console.log('video', response.data);
      //     this.yy_score = parseInt(response.data.data + 0.5)
      //     that.progress = response.data.data * 1.0 / 23 * 100
      //   })
      //   .catch(function (error) {
      //     that.$message({
      //       message: error,
      //       type: 'error'
      //     });
      //     console.log(error);
      //   })
    },
  },
  mounted() {
    this.callCamera();
  },
  beforeDestroy() {
    this.stopRecord();
    // this.recordtype = "BEGIN";
    // console.log("this.recordtype", this.recordtype);
  },
};
var MediaUtils = {
  /**
   * 获取用户媒体设备(处理兼容的问题)
   * @param videoEnable {boolean} - 是否启用摄像头
   * @param audioEnable {boolean} - 是否启用麦克风
   * @param callback {Function} - 处理回调
   */
  getUserMedia: function (videoEnable, audioEnable, callback) {
    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia ||
      window.getUserMedia;
    var constraints = { video: videoEnable, audio: audioEnable };
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
  closeStream: function (stream) {
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
};
</script>

<style>
.record-time {
  text-align: center;
  color: #333;
  font-size: 16px;
}
.tool {
  height: 20vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
}

.tool .btns {
  display: flex;
  align-items: center;
  justify-content: space-evenly;
}

.btn {
  border-radius: 10px;
}
</style>