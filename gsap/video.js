class VideoTweenMax{
  constructor(args) {
    let that = this;
    this.initArgs(args);
    that.setWidthHeight(that);
    that.loadVideo();
    window.addEventListener('resize', function () {
      that.setWidthHeight(that);
      if (that.cruFram) {
        that.renderFrame(that.cruFram)
      }
    })
  }
  initArgs(args) {
    this.canvasDiv = args.canvasDiv;
    this.canvasEle = document.createElement("canvas");
    this.canvasId = "cid_" + new Date().getTime();
    this.canvasEle.id = this.canvasId;
    this.canvasDiv.appendChild(this.canvasEle);
    this.videoEle = args.videoEle;
    this.defPicUrl = args.defPicUrl;
    this.fps = args.fps || 30;
    this.reverse = args.reverse || 0;
    this.frameCount = args.frameCount || 200;
    this.framsStore = new Array();
    this.target = { curImg: 0 }
    this.duration = args.duration;
    this.contain = args.contain || 0
    this.ctx = this.canvasEle.getContext("2d");
    this.vars = {
      that: this,
      curImg: this.frameCount,
      roundProps: 'curImg',
      immediateRender: true,
      ease: Linear.easeNone,
      onUpdate: function (param) {
        let that = param.vars.that;
        if (that.framsStore[0]) {
          let index = parseInt(this.target.curImg / param.vars.curImg * that.framsStore.length)
          index = index <= 0 ? 0 : index - 1;
          if (that.reverse) {
            index = that.framsStore.length - index - 1;
          }
          that.cruFram = that.framsStore[index]
          that.renderFrame(that.cruFram)
        } else {
          let img = new Image()
          img.src = that.defPicUrl
          that.renderFrame(img)
        }
      },
      onUpdateParams: ["{self}"]
    }
  }
  setWidthHeight(obj) {
    obj.width = obj.canvasDiv.clientWidth;
    obj.height = obj.canvasDiv.clientHeight;
    document.getElementById(obj.canvasId).width = obj.width;
    document.getElementById(obj.canvasId).height = obj.height;
  }
  renderFrame(frame) {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.drawImage(frame, 0, 0, this.width, this.height);
  }
  reloadVideo() {
    this.videoEle.pause();
    this.framsStore = new Array();
    this.loadVideo();
  }
  loadVideo() {
    let setIn, framsNumber = 0;
    let that = this;
    this.videoEle.play();
    this.videoEle.addEventListener("loadedmetadata", () => {
      console.log("加载数据, 视频的总长度: " + elevideo.duration);
    });
    this.videoEle.addEventListener("canplaythrough", (res) => {
      console.log("可正常播放");
      if (setIn) clearInterval(setIn);
      setIn = setInterval(() => {
        if (framsNumber > that.frameCount) {
          clearInterval(setIn);
          return;
        };
        that.framsStore[framsNumber] = that.createFrame(this.videoEle, that.width, that.height);
        framsNumber++;
      }, this.fps);
    });
    this.videoEle.addEventListener("ended", () => {
      console.log("视频播放结束...");
      if (setIn) clearInterval(setIn);
      that.frameCount = that.framsStore.length
    });
    this.videoEle.addEventListener("waiting", (res) => {
      console.log("视频加载中...");
      if (setIn) clearInterval(setIn);
    });
    this.videoEle.addEventListener("error", (e) => {
      console.log("视频播放错误...");
      console.log("videoEle error");
      console.log(e)
      console.log(e.codes)
    });
  }
  createFrame(video, width, height) {
    const canvas = window.OffscreenCanvas
      ? new OffscreenCanvas(width, height)
      : document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;
    context.drawImage(video, 0, 0, width, height);

    return canvas;
  }
}