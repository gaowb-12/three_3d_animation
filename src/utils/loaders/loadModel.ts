import { Box3, Vector3 } from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { Engine } from "../engine";

export function loadCharactor(scene: Engine): Promise<GLTF>{
    const glbLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath( '/models/draco/gltf/' );
    dracoLoader.setDecoderConfig({ type: 'js' })
    dracoLoader.preload()
    glbLoader.setDRACOLoader( dracoLoader );
    
    return glbLoader.loadAsync("/models/glb/glb-6.glb", ( xhr )=>{
		// console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
	})
    .then(gltf=>{
        const model = gltf.scene;
        // 获取包围盒
        const box = new Box3().setFromObject(model);
        // 获取包围盒大小
        const size = box.getSize(new Vector3());
        // 获取包围盒中心点
	    const center = box.getCenter(new Vector3());

        // 设置模型缩放
        const scale = 4
        model.scale.set(scale,scale,scale)
        // 设置模型位置
        model.position.sub(center.multiplyScalar(scale))
        scene.add( model );
        scene.camera.position.set(0, 7, 15);
        // 设置相机坐标系
	    scene.camera.updateProjectionMatrix();
        return gltf
    })
    .catch(err=>{
        return err
    })
}