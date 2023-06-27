  <template>
  <div class="recordVideo">
    <div class="content">
      {{ videoContent }}
    </div>
    <div class="video-container">
      <video
        v-if="videoSrc"
        ref="myVideo"
        class="my-video"
        :controls="false"
        :src="videoSrc"
        autoplay
        loop
        :webkit-playsinline="true"
        :playsinline="true"
        x5-video-player-type="h5"
      ></video>
      <VideoRecorder
        v-else
        ref="videoRecorder"
        @success="handlerSuccess"
        @error="handlerError"
      ></VideoRecorder>
    </div>
    <div v-if="!videoSrc" class="record-time">
      <!-- <img v-if="isStart" src="@/assets/images/ing.gif"  alt="">  -->
      <span>{{ digitFormat(recrodTime) }}</span>
    </div>
    <div class="video-action" v-if="isCanUse">
      <div
        class="start"
        v-if="!videoSrc"
        @touchstart.prevent="touchstart"
        @touchend="touchend"
      >
        长按录制
      </div>
      <span class="starting" v-if="isStart"></span>
      <div class="reStart" v-if="videoSrc" @click="handleReStart">重新录制</div>
      <div class="complate" v-if="videoSrc" @click="handleComplate">完成</div>
    </div>
    <div style="text-align: center" v-else>当前手机系统版本不支持摄像录制</div>
    <div class="tips">使用适中的语速，逐字清晰地朗读顶部文字</div>
  </div>
</template>

<script>
import VideoRecorder from "@/components/testComponents.vue";
// import {fileuploadext, processfilesave } from '@/api/user.js'
export default {
  name: "recordVideo",
  components: {
    VideoRecorder,
  },
  data() {
    return {
      recorder: null,
      videoSrc: "",
      // videoSrc:'https://oceanus-trial-file-dev.obs.cn-east-3.myhuaweicloud.com/20221221/b746d257a9644ff7b702e243f2cdd467.mp4',
      recrodTime: 0,
      intervalTime: null,
      isStart: false,
      // ---
      videoContent: "", //录制所读内容
      formData: null, //录制文件
      isCanUse: true, //录制组件是否可用
    };
  },
  created() {
    this.videoContent = this.$route.query.videoContent;
  },
  mounted() {},
  destroyed() {
    this.clearIntervaltime();
  },
  methods: {
    // 开始录制
    touchstart() {
      console.log("===53===开始");
      this.isStart = true;
      this.$nextTick(() => {
        this.startRecordReadTime(); //读秒计时
        this.$refs.videoRecorder && this.$refs.videoRecorder.start();
      });
    },
    // 暂停录制
    touchend() {
      console.log("===56===结束");
      this.$refs.videoRecorder.stop();
      this.isStart = false;
    },
    // 重新录制
    handleReStart() {
      this.clearIntervaltime();
      this.videoSrc = "";
    },
    // 完成
    handleComplate() {
      // 上传文件获取文件id   自己业务逻辑
      //   fileuploadext(this.formData).then(({success, data}) => {
      //     if(success){
      //       //...
      //     }
      //   })
      console.log("this.formData", this.formData);
    },
    handlerSuccess(val) {
      console.log("文件返回信息=============", val);
      this.formData = val.formData;
      this.videoSrc = val.localUrl;
      this.$nextTick(() => {
        // this.$refs.myVideo && this.$refs.myVideo.play();
      });
    },
    handlerError(val) {
      console.log("失败===70===", val);
      this.isCanUse = false;
    },
    // 清除定时器
    clearIntervaltime() {
      this.recrodTime = 0;
      if (this.intervalTime) {
        clearInterval(this.intervalTime);
      }
    },
    // 录制时间
    startRecordReadTime() {
      this.intervalTime = setInterval(() => {
        if (this.isStart) {
          this.recrodTime += 1;
        }
      }, 1000);
    },
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
};
</script>

<style scoped>
.record-time {
  text-align: center;
  margin-top: 20px;
  color: #333;
}

.record-time img {
  width: 10px;
  height: 10px;
  margin-right: 5px;
}
.video-action {
  margin-top: 70px;
  display: flex;
  position: relative;
}

.video-action div {
  width: 166px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  border-radius: 20px;
  font-size: 14px;
  margin: 0 auto;
}

.video-action .start {
  color: #fff;
  background: #fda21d;
  border: 1px solid #fda21d;
  z-index: 99;
}

.video-action .starting {
  position: absolute;
  width: 180px;
  height: 56px;
  border-radius: 28px;
  left: 0;
  right: 0;
  top: -7px;
  margin: 0 auto;
  animation: breating 1.5s linear infinite;
}
@keyframes breating {
  0% {
    transform: scale(1);
    background: #fecaa7;
  }
  50% {
    transform: scale(1.1);
    background: #ffe4d0;
  }
  100% {
    background: #fff6ef;
    transform: scale(1.2);
  }
}

.video-action .stop {
  color: #666;
  background: #fff;
  border: 1px solid #dcdee2;
}
.video-action .reStart {
  color: #666;
  background: #fff;
  border: 1px solid #dcdee2;
}
.video-action .complate {
  color: #fff;
  background: #fda21d;
  border: 1px solid #fda21d;
}
.tips {
  font-size: 14px;
  line-height: 20px;
  text-align: center;
  color: #4284f5;
  margin-top: 24px;
}

.content {
  box-sizing: border-box;
  padding: 24px 21px;
  width: 343px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.06);
  font-size: 20px;
  line-height: 30px;
  text-align: left;
  color: #666;
  margin: 0 auto;
  margin-top: 30px;
}

.video-container {
  width: 256px;
  height: 256px;
  background-color: #999999;
  border-radius: 100% !important;
  margin: 0 auto;
  text-align: center;
  margin-top: 54px;
  overflow: hidden !important;
  -webkit-backface-visibility: hidden;
  -webkit-transform: translate3d(0, 0, 0);
  position: relative;
}
.my-video {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  align-items: center;
  /* // object-fit: fill; //视频铺满  仅android可以 */
  object-fit: cover;
}

/* 隐藏video 所有控件 */
.show-video::-webkit-media-controls-enclosure {
  display: none !important;
}
</style>