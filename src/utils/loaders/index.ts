import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js"
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js"
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js"

export class Loader{
    glb = new GLTFLoader()
    fbx = new FBXLoader()
    gltf = new GLTFLoader()
    draco = new DRACOLoader()
    obj = new OBJLoader()
    stl = new STLLoader()
}