/**
 * Created by tianwu on 14/12/23.
 */
(function() {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||    // name has changed in Webkit
            window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
})();

(function (window, $) {

    var mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent),
        touchstart = mobile ? "touchstart" : "mousedown",
        touchmove = mobile ? "touchmove" : "mousemove",
        touchend = mobile ? "touchend" : "mouseup";

    var defaultOption = {
        defColor: "#7c8197",
        hoverColor:"#25aaff",
        defCirRadius: 32,
        cirLineWidth: 1,
        smalCirRadius:10,
        hoverSmalRadius: 10,
        lineWidth: 1,
        padding: 16,
        callBack:function(){}
    }

    var lock = function (domobj,option) {
        this.$canvas = domobj;
        this.HEIGHT = this.$canvas.height();
        this.WIDTH = this.$canvas.width();
        //要设置canvas
        this.$canvas.attr({"width": this.WIDTH, "height": this.HEIGHT});
        this.ctx = this.$canvas[0].getContext('2d');
        this.option = $.extend({}, defaultOption, option);
        this.init();
    };
    lock.prototype = {
        circles:[],
        lines:[],
        number:[],
        moveStart:false,
        init: function (){
            var _cwidth=(this.WIDTH-2*this.option.padding)/ 3,
                _cheight=(this.HEIGHT-2*this.option.padding)/ 3,
                _this=this;
            for (var i = 0; i < 9; i++) {
                var circle= {
                    x:this.option.padding+_cwidth/2 + (i % 3) * _cwidth,
                    y:this.option.padding+_cheight/2+ (parseInt(i / 3)) * _cheight,
                    r:this.option.defCirRadius,
                    r2:this.option.smalCirRadius,
                    hoverColor:this.option.hoverColor,
                    status:0,
                    color: this.option.defColor,
                    lineWidth: this.option.cirLineWidth
                };
                this.circles.push(circle);
            };
            this.draw();

            this.$canvas.bind(touchstart, function(e){
                _this.mydown(e)
            });

            this.$canvas.bind(touchend,function(e){
                _this.myUp(e)
            });
            this.$canvas.bind(touchmove, function(e){
                _this.myMove(e)
            });
        },
        draw:function() {
            var _this=this;
            _this.clear();
            var l = _this.lines.length;
            for (var i = 0; i < l; i++) {
                _this.drawline(_this.lines[i]);
            }

            l = _this.circles.length;
            for (var i = 0; i < l; i++) {
                _this.drawshape(_this.circles[i]);
            }
            requestAnimationFrame(function(){
                _this.draw();
            })
        },
        drawshape:function(shape){

            if (shape.status == 0) {
                this.ctx.strokeStyle = shape.color;
                this.ctx.lineWidth = shape.lineWidth;
                this.ctx.beginPath();
                this.ctx.arc(shape.x, shape.y, shape.r - shape.lineWidth, 0, Math.PI * 2, true);
                this.ctx.closePath();
                this.ctx.stroke();
            }
            else if (shape.status == 1) {
                this.ctx.strokeStyle = shape.hoverColor;
                this.ctx.lineWidth = shape.lineWidth;
                this.ctx.beginPath();
                this.ctx.arc(shape.x, shape.y, shape.r - shape.lineWidth, 0, Math.PI * 2, true);
                this.ctx.closePath();
                this.ctx.stroke();

                this.ctx.fillStyle = shape.hoverColor;
                this.ctx.beginPath();
                this.ctx.arc(shape.x, shape.y, shape.r2, 0, Math.PI * 2, true);
                this.ctx.closePath();
                this.ctx.fill();
            }
        },
        drawline:function(line) {
            this.ctx.beginPath();
            this.ctx.moveTo(line.x1, line.y1);
            this.ctx.lineTo(line.x2, line.y2);
            this.ctx.lineWidth = line.lineWidth;
            this.ctx.lineJoin = "round";
            this.ctx.strokeStyle = line.color;
            this.ctx.stroke();
        },
        clear:function() {
            this.ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
        },
        mydown:function (e){
           this.moveStart=true;
            var l = this.circles.length;
            for (var i = 0; i < l; i++) {
                this.circles[i].status=0;
            };
            this.lines=[];
            this.number=[];
        },
        myUp:function(e){
            this.moveStart=false;
            this.lines.pop();
            this.option.callBack.call(this,this.number);
        },
        myMove:function (e){
            if(!this.moveStart){
                return false;
            }
            e.preventDefault();
            var touchPointer = mobile ? e.touches[0] :e;
            var mouseX = touchPointer.pageX - this.$canvas.offset().left;
            var mouseY = touchPointer.pageY - this.$canvas.offset().top;

            var l = this.circles.length;

            for (var i = 0; i < l; i++) {
                var cx=this.circles[i].x,
                    cy=this.circles[i].y,
                    cr=this.circles[i].r;

                if ((mouseX-cx)*(mouseX-cx)+(mouseY-cy)*(mouseY-cy) < cr*cr && this.number[this.number.length-1] !=i+1)
                {
                    if(this.number.length>0){
                        var line={
                            x1:this.circles[this.number[this.number.length-1]-1].x,
                            y1:this.circles[this.number[this.number.length-1]-1].y,
                            x2:cx,
                            y2:cy,
                            color:this.option.hoverColor,
                            lineWidth:this.option.lineWidth
                        }
                        this.lines[this.number.length-1]=line;
                    }
                    this.circles[i].status=1;
                    this.number.push(i+1);
                    break;
                }
            }
            var line={
                x1:this.circles[this.number[this.number.length-1]-1].x,
                y1:this.circles[this.number[this.number.length-1]-1].y,
                x2:mouseX,
                y2:mouseY,
                color:this.option.hoverColor,
                lineWidth:this.option.lineWidth
            }
            this.lines[this.number.length-1]=line;
            //跟新状态
        }
    };

    $.fn.lock=function(option){
        new lock($(this),option);
    }

})(window, Zepto)