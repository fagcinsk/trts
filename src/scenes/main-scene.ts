import { Noise } from "noisejs"
import Chunk from "../chunk"
import { Input } from 'phaser'

type KeyMap = { [key: string]: Input.Keyboard.Key }


export default class MainScene extends Phaser.Scene {
  tileSet: Phaser.Tilemaps.Tileset
  tileSetWater: Phaser.Tilemaps.Tileset
  followPoint: Phaser.Math.Vector2
  cameraSpeed: number = 10
  chunks = []
  noise: Noise

  movementKeys: KeyMap
  zoomKeys: KeyMap

  chunkRadiusToLoad = 3

  constructor() {
    super({ key: "MainScene" })
  }

  create(): void {
    this.noise = new Noise(1)
    this.movementKeys = this.input.keyboard.addKeys('W,S,A,D') as KeyMap
    this.zoomKeys = this.input.keyboard.addKeys('Z,X') as KeyMap

    this.followPoint = new Phaser.Math.Vector2(
      this.cameras.main.worldView.x + this.cameras.main.worldView.width * 0.5,
      this.cameras.main.worldView.y + this.cameras.main.worldView.height * 0.5
    )
  }

  getChunk(x, y) {
    for (let chunk of this.chunks) {
      if (chunk.x === x && chunk.y === y) return chunk
    }
    return null
  }

  update() {
    let chunkX = Math.round(this.followPoint.x >> 8)
    let chunkY = Math.round(this.followPoint.y >> 8)

    let SX = chunkX - this.chunkRadiusToLoad
    let SY = chunkY - this.chunkRadiusToLoad
    let EX = chunkX + this.chunkRadiusToLoad
    let EY = chunkY + this.chunkRadiusToLoad

    for (let x = SX; x < EX; x++) {
      for (let y = SY; y < EY; y++) {
        if (this.getChunk(x, y)) continue
        this.chunks.push(new Chunk(this, x, y))
      }
    }

    for (let chunk of this.chunks) {
      if (!chunk) continue

      if (Phaser.Math.Distance.Between(chunkX, chunkY, chunk.x, chunk.y) <= this.chunkRadiusToLoad) {
        chunk.load()
      } else {
        chunk.unload()
      }
    }

    let speed = this.cameraSpeed / this.cameras.main.zoom

    if (this.movementKeys.W.isDown) this.followPoint.y -= speed
    if (this.movementKeys.S.isDown) this.followPoint.y += speed
    if (this.movementKeys.A.isDown) this.followPoint.x -= speed
    if (this.movementKeys.D.isDown) this.followPoint.x += speed

    if (this.zoomKeys.Z.isDown) this.changeZoom(0.01)
    if (this.zoomKeys.X.isDown) this.changeZoom(-0.01)

    this.cameras.main.centerOn(this.followPoint.x, this.followPoint.y)
  }

  changeZoom(delta) {
    this.cameras.main.zoom += delta
    this.cameras.main.zoom = Phaser.Math.Clamp(this.cameras.main.zoom, 0.5, 4)
    this.chunkRadiusToLoad = this.cameras.main.width >> 7
  }
}
