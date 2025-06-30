const PImage = require("pureimage");
const fs = require('fs');
const { getAsset } = require("./units.js")
const { all_units } = require("./ids.js");
const { Stream } = require("stream");
const ggeConfig = require("./ggeConfig.json")

let wavePattern = {
  leftFlank: {
    startX: 30,
    startY: 43 + 1,
    maxWidth: 5,
    maxHeight: 20,
  },
  front: {
    startX: 194,
    startY: 43 + 1,
    maxWidth: 5,
    maxHeight: 20,
  },
  rightFlank: {
    startX: 359,
    startY: 43 + 1,
    maxWidth: 5,
    maxHeight: 20,
  },
  courtyard: {
    startX: 113,
    startY: 273 + 1,
    maxWidth: 10,
    maxHeight: 20
  }
}


let createLayout = ((GA) => {
  let passThroughStream = new Stream.PassThrough()
    ; (async () => {
      await PImage.registerFont(ggeConfig.fontPath, "arial").load()

      let img = await PImage.decodePNGFromStream(fs.createReadStream("./assets/asset.png"))
      let ctx = img.getContext("2d")

      let displayAttack = (attack, attackSection) => 
        attack.map((wave, index) => addUnit(
          all_units[wave[0]],
          ctx,
          attackSection.startX,
          attackSection.startY,
          wave[1],
          attackSection.maxWidth,
          attackSection.maxHeight,
          index
        ))

      let resolves = []

      resolves.push(...displayAttack(GA.L, wavePattern.leftFlank))
      resolves.push(...displayAttack(GA.M, wavePattern.front))
      resolves.push(...displayAttack(GA.R, wavePattern.rightFlank))
      resolves.push(...displayAttack(GA.RW, wavePattern.courtyard))

      await Promise.allSettled(resolves)
      await PImage.encodePNGToStream(img, passThroughStream, { deflateStrategy: 3, deflateLevel: 9 })
    })();

  return passThroughStream
})

let addUnit = (unit, /**@type {PImage.Context}*/ctx, x, y, count, maxWidth, maxHeight, index) => new Promise(async (resolve2, reject2) => {
  let resolve = (d) =>{
    
    console.log(`end ${unit?.name}_${unit?.group}_${unit?.type}`)
    resolve2(d)
  }
  let reject = (d) => {
    
    console.log(`end fail ${unit?.name}_${unit?.group}_${unit?.type}`)
    reject2(d)
  }
  try {
    console.log(`start ${unit?.name}_${unit?.group}_${unit?.type}`)
    let asset = await getAsset(`${unit?.name}_${unit?.group}_${unit?.type}`)

    asset.on("error", reject)
    let unitImage = await PImage.decodePNGFromStream(asset)

    x += 29 * (index % maxWidth)
    y += 42 * (Math.floor(index / maxWidth))

    if (index > maxHeight)
      return reject()

    if (index == maxHeight) {
      ctx.font = "35ft arial"
      ctx.fillStyle = "#000000"
      let str = "..."
      let textLength = ctx.measureText(str)
      ctx.fillText(str, x + (32 - textLength.width) / 2, y + 32 - 10 + 1)
      return
    }

    ctx.drawImage(
      unitImage,
      0,
      0,
      unitImage.width,
      unitImage.height,
      x,
      y,
      unitImage.width,
      unitImage.height)

    let textHeight = 12;
    ctx.font = `${textHeight}px arial`
    let textLength = ctx.measureText(`${count}`)

    ctx.fillStyle = "#E3C9A8"
    ctx.fillRect(x, y + unitImage.height, unitImage.width, textHeight + 5)

    ctx.fillStyle = "#000000"
    ctx.fillText(`${count}`, x + (unitImage.width - textLength.width) / 2, y + unitImage.height + textHeight)

    if (unit?.level) {
      let image = await PImage.decodePNGFromStream(fs.createReadStream("./assets/image.png"))
      textHeight = 12
      ctx.font = `${textHeight}px arial`
      textLength = ctx.measureText(`${unit.level}`)
      ctx.drawImage(
        image,
        0,
        0,
        image.width,
        image.height,
        x + unitImage.width / 2 - 1,
        y - 11 / 2 - 1,
        20 + 2,
        20 + 2)

      ctx.fillText(`${unit.level}`, x + unitImage.width - textLength.width / 2 - 2, y + textHeight / 2 + 2)
    }
    resolve()
  }
  catch (err) {
    reject(err)
  }
})

module.exports = { createLayout }