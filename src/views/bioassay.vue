<template>
  <div>
    <div class="face">
      <!-- <audio
        id="audio"
        ref="audioPlay"
        :src="videoImg ? faceStep[currentStep].voice : ''"
        loop
        autoplay
      >
        您的浏览器不支持音频播放。
      </audio> -->

      <div class="face-content">
        <video id="video" ref="videoPlay" height="100%" width="100%" autoplay>
          您的浏览器不支持视频录制。
        </video>
      </div>

      <img class="face-img" src="/static/images/landpage/liveface/face2.png" />
      <!-- <button id="snap" @click="getPhoto">Snap Photo</button> -->
      <!-- <canvas id="canvas" width="480" height="320"></canvas> -->
    </div>

    <div class="step">
      <ul class="step-ul">
        <li class="step-li">
          <!-- v-for="(item, index) in faceStep" :key="index" v-if="currentStep==index" -->
          <p class="step-title">
            <span>{{ faceStep[currentStep].title }}</span>
            <img
              class="step-titleimg"
              @click="videoImg = !videoImg"
              :src="
                videoImg
                  ? '/static/images/landpage/liveface/open.png'
                  : '/static/images/landpage/liveface/close.png'
              "
              alt=""
            />
          </p>
          <img class="step-img" :src="faceStep[currentStep].img" alt="" />
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: "face",
  props: {
    mediaBegin: {
      //开启视频录入
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      currentStep: 0, //提示图片
      videoImg: true, //音频图片控制
      constraints: {
        //视频默认设置
        audio: false,
        // video: true,
        video: { facingMode: "user" }, //调用前置摄像头，后置摄像头使用video: { facingMode: { exact: "environment" } }
      },
      faceStep: [
        {
          title: "请先眨眨眼",
          img: "/static/images/landpage/liveface/step-eye.gif",
          voice: "/static/voice/liveness_eye.mp3",
        },
        {
          title: "请张开嘴",
          img: "/static/images/landpage/liveface/step-mou.gif",
          voice: "/static/voice/liveness_mouth.mp3",
        },
        {
          title: "请点点头",
          img: "/static/images/landpage/liveface/step-down.gif",
          voice: "/static/voice/liveness_head_down.mp3",
        },
        {
          title: "请最后摇摇头",
          img: "/static/images/landpage/liveface/step-header.gif",
          voice: "/static/voice/liveness_head_left_right.mp3",
        },
      ],
    };
  },

  mounted() {
    // setTimeout(()=>{this.mediaBegin = true},2000);

    let _this = this;
    function getFACE() {
      _this.currentStep += 1;
      if (_this.currentStep > 3) {
        _this.currentStep = 0;
      }
    }
    setInterval(() => {
      getFACE();
    }, 5000);

    this.$nextTick(() => {
      //音频控制设置
      var audio = this.$refs.audioPlay;
      if (audio.controls) {
        audio.controls = false;
      }
    });
  },
  methods: {
    /* 拍照 */
    /* ================================================== */
    getPhoto() {
      let canvas = document.getElementById("canvas");
      let context = canvas.getContext("2d");
      let video = document.getElementById("video");
      context.drawImage(video, 0, 0, 480, 320);
    },

    /* 开始录制前判断 */
    /* ================================================== */
    getMediaBegin() {
      var _this = this;
      console.log('begin');

      if (navigator.mediaDevices.getUserMedia) {
        //最新的标准API
        navigator.mediaDevices
          .getUserMedia(_this.constraints)
          .then(_this.getMediaSuccess)
          .catch(_this.getMediaError);
      } else if (navigator.webkitGetUserMedia) {
        //webkit核心浏览器
        navigator.webkitGetUserMedia(
          _this.constraints,
          _this.getMediaSuccess,
          _this.getMediaError
        );
      } else if (navigator.mozGetUserMedia) {
        //firfox浏览器
        navigator.mozGetUserMedia(
          _this.constraints,
          _this.getMediaSuccess,
          _this.getMediaError
        );
      } else if (navigator.getUserMedia) {
        //旧版API
        navigator.getUserMedia(
          _this.constraints,
          _this.getMediaSuccess,
          _this.getMediaError
        );
      } else {
        let ua = navigator.userAgent.toLowerCase();
        if (ua.match(/iPhone\sOS/i) == "iphone os") {
          _this.$Message.error("请用window设备，或者安卓手机进行检测");
          return false;
        } else {
          _this.$Message.error(
            "您的设备没有安装摄像头，或者不支持视频录入，请更换设备或者更换浏览器再访问"
          );
        }
      }
    },

    /* 录制接入成功 */
    /* ================================================== */
    getMediaSuccess(stream) {
      console.log('stream',stream);
      var _this = this;
      var video = this.$refs.videoPlay;
      //兼容webkit核心浏览器
      let compatibleURL = window.URL || window.webkitURL;
      //将视频流设置为video元素的源
      console.log(stream);
      console.log(compatibleURL.createObjectURL(stream));
      try {
        video.srcObject = stream;

        if (video.controls) {
          video.controls = false;
        }
      } catch (error) {
        video.src = compatibleURL.createObjectURL(stream);

        if (video.controls) {
          video.controls = false;
        }
      }

      video.onloadedmetadata = function () {
        video.play();
        _this.sentMediaStream(stream);
      };
      // video.play();
      video.onerror = function () {
        _this.$Message.error("录制出现错误，请重新进行活体检测");
        stream.stop();
      };
    },

    /* 录制接入失败 */
    /* ================================================== */
    getMediaError(error) {
      this.$Message.error(
        `访问用户媒体设备失败${error.name}, ${error.message}`
      );
    },

    /* 发送视频数据流 然后判断 */
    /* ================================================== */
    sentMediaStream(stream) {
      alert("sent");
    },
  },

  watch: {
    mediaBegin(nv, ov) {
      if (nv) {
        this.getMediaBegin();
      }
    },
  },
};
</script>

<style lang="less" scoped>
.face {
  width: 400px;
  height: 450px;
  position: relative;
  .face-img {
    width: 400px;
    height: 450px;
    position: absolute;
    left: 0px;
    top: 0px;
  }
  .face-content {
    width: 310px;
    height: 322px;
    position: absolute;
    top: 64px;
    left: 45px;
    #video {
      object-fit: fill;
    }
  }
}
.step {
  text-align: center;
  margin-top: 30px;
  .step-ul {
    .step-li {
      .step-title {
        font-size: 16px;
        color: #65dffe;
        padding-bottom: 10px;
        .step-titleimg {
          height: 26px;
          width: 26px;
          margin-left: 20px;
          cursor: pointer;
        }
      }
      .step-img {
        height: 150px;
        width: 150px;
        border: 3px solid #eecfa1;
        border-radius: 50%;
        img {
          height: 100%;
          width: auto;
        }
      }
    }
  }
}
</style>
