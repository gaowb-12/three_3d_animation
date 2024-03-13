import { AnimationClip, AnimationMixer, AnimationAction, LoopRepeat } from "three";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

export class ModelAnimation{
    private animations: AnimationClip[]
    private animationMixer: AnimationMixer
    private animationAction: AnimationAction
    constructor(gltf: GLTF){
        this.animations = gltf.animations
        this.animationMixer = new AnimationMixer(gltf.scene)
        this.animationAction = new AnimationAction(this.animationMixer, this.animations[0], gltf.scene)
    }
    start(){
        this.animationAction.setEffectiveTimeScale(1)
		this.animationAction.setEffectiveWeight(0.5)
		this.animationAction.setLoop(LoopRepeat, 4000)
        this.animationAction.play()
    }
    end(){
        this.animationAction.stop()
    }
}