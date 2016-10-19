//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////

class Main extends egret.DisplayObjectContainer {

    /**
     * 加载进度界面
     * Process interface loading
     */
    private loadingView:LoadingUI;

    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event:egret.Event) {
        //设置加载进度界面
        //Config to load process interface
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);

        //初始化Resource资源加载库
        //initiate Resource loading library
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    }

    /**
     * 配置文件加载完成,开始预加载preload资源组。
     * configuration file loading is completed, start to pre-load the preload resource group
     */
    private onConfigComplete(event:RES.ResourceEvent):void {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
        RES.loadGroup("preload");
    }

    /**
     * preload资源组加载完成
     * Preload resource group is loaded
     */
    private onResourceLoadComplete(event:RES.ResourceEvent):void {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
            this.createGameScene();
        }
    }

    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    private onItemLoadError(event:RES.ResourceEvent):void {
        console.warn("Url:" + event.resItem.url + " has failed to load");
    }

    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    private onResourceLoadError(event:RES.ResourceEvent):void {
        //TODO
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        //Ignore the loading failed projects
        this.onResourceLoadComplete(event);
    }

    /**
     * preload资源组加载进度
     * Loading process of preload resource group
     */
    private onResourceProgress(event:RES.ResourceEvent):void {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    }

    private textfield:egret.TextField;

    /**
     * 创建游戏场景
     * Create a game scene
     */
    private createGameScene():void {
        var sky:egret.Bitmap = this.createBitmapByName("ad1ca8345982b2b78ef7f3ee33adcbef76099b0c_png");
        this.addChild(sky);
        var stageW:number = this.stage.stageWidth;
        var stageH:number = this.stage.stageHeight;
        sky.width = stageW;
        sky.height = stageH;
        var player = new Player();
        player.idle();
        this.addChild(player);
        sky.touchEnabled=true;
        sky.addEventListener(egret.TouchEvent.TOUCH_END,(e)=>{player.move(e.stageX-50,e.stageY-50);
            },this);

      

        

        //根据name关键字，异步获取一个json配置文件，name属性请参考resources/resource.json配置文件的内容。
        // Get asynchronously a json configuration file according to name keyword. As for the property of name please refer to the configuration file of resources/resource.json.
        
    }

    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
     */
    private createBitmapByName(name:string):egret.Bitmap {
        var result = new egret.Bitmap();
        var texture:egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }
}


class iw extends egret.DisplayObjectContainer{
    private IdleArray:egret.Bitmap[];
    private WalkArray:egret.Bitmap[];
    private timeOnEnterFrame:number = 0;
    private frameNumber = 0;
    //判断是不是第一次播放，是否移除之前动作的最后一帧
    private firstplay = true;
    //判断状态是IDLEorWALK
    private walking = false;
    private idling = false;
    private idleAnimatorEnd = 10;
    private walkAnimatorEnd = 7;
    public mode = "Walk";

    public constructor(mode:string){
        super();
        var walk1:egret.Bitmap = new egret.Bitmap(RES.getRes("1_png"));
        var walk2:egret.Bitmap = new egret.Bitmap(RES.getRes("2_png"));
        var walk3:egret.Bitmap = new egret.Bitmap(RES.getRes("3_png"));
        var walk4:egret.Bitmap = new egret.Bitmap(RES.getRes("4_png"));
        var walk5:egret.Bitmap = new egret.Bitmap(RES.getRes("5_png"));
        var walk6:egret.Bitmap = new egret.Bitmap(RES.getRes("6_png"));
        var walk7:egret.Bitmap = new egret.Bitmap(RES.getRes("7_png"));
        var walk8:egret.Bitmap = new egret.Bitmap(RES.getRes("8_png"));
        var idle01:egret.Bitmap = new egret.Bitmap(RES.getRes("01_png"));
        var idle02:egret.Bitmap = new egret.Bitmap(RES.getRes("02_png"));
        var idle03:egret.Bitmap = new egret.Bitmap(RES.getRes("03_png"));
        var idle04:egret.Bitmap = new egret.Bitmap(RES.getRes("04_png"));
        var idle05:egret.Bitmap = new egret.Bitmap(RES.getRes("05_png"));
        var idle06:egret.Bitmap = new egret.Bitmap(RES.getRes("06_png"));
        var idle07:egret.Bitmap = new egret.Bitmap(RES.getRes("07_png"));
        var idle08:egret.Bitmap = new egret.Bitmap(RES.getRes("08_png"));
        var idle09:egret.Bitmap = new egret.Bitmap(RES.getRes("09_png"));
        var idle10:egret.Bitmap = new egret.Bitmap(RES.getRes("10_png"));
        var idle11:egret.Bitmap = new egret.Bitmap(RES.getRes("11_png"));
        this.IdleArray = [idle01,idle02,idle03,idle04,idle05,idle06,idle07
        ,idle08,idle09,idle10,idle11];
        this.WalkArray = [walk1,walk2,walk3,walk4,walk5,walk6,walk7,walk8];
        this.mode = mode;
        this.once(egret.Event.ADDED_TO_STAGE,this.onLoad,this);
    }
    public reLoad(){
        this.firstplay = true;
       if (this.idling==true){
           if (this.frameNumber ==0){
               this.frameNumber=11;
           }
           this.removeChild(this.IdleArray[this.frameNumber-1]);
       }
       if(this.walking ==true){
           if(this.frameNumber==0){
               this.frameNumber=8;
           }
           this.removeChild(this.WalkArray[this.frameNumber-1]);
       }
       this.idling=false;
       this.walking=false;
       this.frameNumber=0;
    }
    private onLoad(event:egret.Event){
        this.addEventListener(egret.Event.ENTER_FRAME,this.onEnterFrame,this);
        this.timeOnEnterFrame=egret.getTimer();
    }
    private onEnterFrame(e:egret.Event){
        if(this.mode=="Idle"){
            if(this.frameNumber>=1){
                this.removeChild(this.IdleArray[this.frameNumber-1]);
            }else if(this.frameNumber==0 && this.firstplay==false){
                this.removeChild(this.IdleArray[this.idleAnimatorEnd]);
            }
            this.addChild(this.IdleArray[this.frameNumber]);
            this.idling=true;
            this.frameNumber++;
            if(this.frameNumber==11){
                this.frameNumber=0;
            }
            this.firstplay=false;
            this.timeOnEnterFrame=egret.getTimer();
        }else if(this.mode="Walk"){
            if(this.frameNumber>=1){
                this.removeChild(this.WalkArray[this.frameNumber-1]);
            }else if(this.frameNumber==0 && this.firstplay==false){
                this.removeChild(this.WalkArray[this.walkAnimatorEnd]);
            }
            this.addChild(this.WalkArray[this.frameNumber]);
            this.walking=true;
            this.frameNumber++;
            if(this.frameNumber==8){
                this.frameNumber=0;
            }
            this.firstplay=false;
            this.timeOnEnterFrame=egret.getTimer();
        }

    }
}

class Player extends egret.DisplayObjectContainer{
    _label:egret.TextField;
    _body:iw;
    _stateMachine:StateMachine;

    constructor(){
    super();
    this._body = new iw("Idle");
    this._label=new egret.TextField();
    this._stateMachine=new StateMachine();
    this._label.y=30;
    this._label.text="start";
    this.addChild(this._body);
    this.addChild(this._label);
}

move(targetX:number,targetY:number){
    this._stateMachine.setState(new PlayerMoveState(this,targetX,targetY));
}
idle(){this._stateMachine.setState(new PlayerIdleState(this));
    }
}

class StateMachine{
    _currentState:State;
    setState(s:State){
        if(this._currentState){
            this._currentState.onExit();

        }
        this._currentState = s;
        this._currentState.onEnter();
    }
}
interface State{
    onEnter();
    onExit();

}

class PlayerState implements State{
    _player:Player;
    constructor(player:Player){
        this._player = player;
    }
    onEnter(){}
    onExit(){}
}


class PlayerMoveState extends PlayerState{
    _targetX:number;
    _targetY:number;
    constructor(player:Player,targetX:number,targetY:number){
        super(player);
        this._targetX = targetX;
        this._targetY = targetY;

    }

    onEnter(){
        this._player._label.text="moving";
        this._player._body.reLoad();
        this._player._body.mode="Walk";
        var tw = egret.Tween.get(this._player._body);
        tw.to({x:this._targetX,y:this._targetY},500).call(this._player.idle,this._player);
    }
}

class PlayerIdleState extends PlayerState{
    onEnter(){
        this._player._body.reLoad();
        this._player._body.mode="Idle"
        this._player._label.text = "idling"

    }
}



   