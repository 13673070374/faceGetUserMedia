<template>
  <div>
    <video ref="video" autoplay playsinline></video>
    <canvas ref="canvas"></canvas>
    <button style="color: #fff; background: blue" @click="detectFaces">
      开始检测
    </button>
  </div>
</template>

<script>
import * as tf from "@tensorflow/tfjs";
import * as faceapi from "face-api.js";

export default {
  mounted() {
    this.loadModels();
    this.setupCamera();
    this.detectFaces();
  },
  methods: {
    async loadModels() {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
      await faceapi.nets.faceExpressionNet.loadFromUri("/models");
    },
    async setupCamera() {
      const video = this.$refs.video;
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
    },
    async detectFaces() {
      const video = this.$refs.video;
      const canvas = this.$refs.canvas;
      const ctx = canvas.getContext("2d");
      const displaySize = { width: video.width, height: video.height };

      setInterval(async () => {
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();

        // 在这里处理检测到的表情，例如眨眼、张嘴、向左看、向右看
        // 示例：检测眨眼
        detections.forEach((detection) => {
          const expressions = detection.expressions;
          if (expressions.blink > 0.5) {
            console.log("眨眼");
          }
        });

        // 将视频帧绘制到 canvas 上
        ctx.drawImage(video, 0, 0, displaySize.width, displaySize.height);

        // 将 canvas 转换为 Blob 对象
        canvas.toBlob(async (blob) => {
          // 在这里将 Blob 对象传给后端
          // 示例：使用 fetch API 发送 POST 请求
          const formData = new FormData();
          formData.append("video", blob);
          console.log("formData", formData);

          // const response = await fetch('/api/validate', {
          //   method: 'POST',
          //   body: formData,
          // });

          // // 处理后端返回的结果
          // const result = await response.json();
          // console.log(result);
        }, "video/webm");
      }, 100);
    },
  },
};
</script>