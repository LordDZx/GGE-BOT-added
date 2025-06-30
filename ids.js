let buildings = []
let units = [] 
let tools = []
let all_units = []
const fs = require("fs")

let xml = JSON.parse(fs.readFileSync("./items.json", { encoding: 'utf8' }));

xml.buildings.forEach(element => {
    buildings[element.name] ??= []

    if (element.buildingGroundType != "DECO" && element.buildingGroundType != "CustomDeco")
        buildings[element.name][element.level] = element
    else
        buildings[element.name][element.type] = element
    buildings[element.wodID] = element
});

xml.units.forEach((element) => {
    if (element.level != undefined) {
        all_units[element.type] ??= []
        all_units[element.type][element.level] = element
    }
    else
        all_units[element.type] = element
    all_units[element.wodID] = element
})
xml.units.forEach((element) => {
    if (!["Eventunit", "Barracks"].includes(element.name))
        return
    if (element.level != undefined) {
        units[element.type] ??= []
        units[element.type][element.level] = element
    }
    else
        units[element.type] = element
    units[element.wodID] = element
});

xml.units.forEach(element => {
    if (element.name != "Workshop")
        return
    if (element.level != undefined) {
        tools[element.type] ??= []
        tools[element.type][element.level] = element
    }
    else {
        tools[element.type] = element
    }
    tools[element.wodID] = element
});

module.exports = { buildings, units, tools, all_units }
