namespace SpriteKind {
    export const Tower = SpriteKind.create()
}
function initialize_variables () {
    wave = 0
    display_wave = false
    wave_begin = false
}
function on_valid_land_spot (sprite: Sprite) {
    for (let tile of [myTiles.tile1, sprites.castle.tileGrass1, sprites.castle.tileGrass3, sprites.castle.tileGrass2]) {
        if (sprite.tileKindAt(TileDirection.Center, tile)) {
            return true
        }
    }
    return false
}
scene.onPathCompletion(SpriteKind.Enemy, function (sprite, location) {
    sprite.destroy()
    scene.cameraShake(2, 100)
    if (!(debug) || false) {
        info.changeLifeBy(sprites.readDataNumber(sprite, "health") * 2 * -1)
    }
})
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    blockMenu.setColors(1, 15)
    // https://bloons.fandom.com/wiki/Tower_price_lists#Bloons_TD_5:~:text=%24.-,Bloons%20TD%205
    blockMenu.showMenu(["Cancel", "Dart Monkey"], MenuStyle.Grid, MenuLocation.BottomHalf)
    wait_for_menu_select()
    if (blockMenu.selectedMenuIndex() == 0) {
    	
    } else if (blockMenu.selectedMenuIndex() == 1 && ((info.score() >= 30 || debug) && on_valid_land_spot(sprite_cursor_pointer))) {
        sprite_tower = sprites.create(img`
            . . . . f f f f f . . . . . . . 
            . . . f e e e e e f . . . . . . 
            . . f d d d d e e e f . . . . . 
            . c d f d d f d e e f f . . . . 
            . c d f d d f d e e d d f . . . 
            c d e e d d d d e e b d c . . . 
            c d d d d c d d e e b d c . f f 
            c c c c c d d d e e f c . f e f 
            . f d d d d d e e f f . . f e f 
            . . f f f f f e e e e f . f e f 
            . . . . f e e e e e e e f f e f 
            . . . f e f f e f e e e e f f . 
            . . . f e f f e f e e e e f . . 
            . . . f d b f d b f f e f . . . 
            . . . f d d c d d b b d f . . . 
            . . . . f f f f f f f f f . . . 
            `, SpriteKind.Tower)
        sprite_tower.setPosition(sprite_cursor_pointer.x, sprite_cursor_pointer.y)
        if (!(debug)) {
            info.changeScoreBy(-30)
        }
    } else if (!(on_valid_land_spot(sprite_cursor_pointer))) {
        sprite_cursor_pointer.say("Not on valid spot!", 1000)
    } else {
        sprite_cursor_pointer.say("Not enough money!", 1000)
    }
})
spriteutils.createRenderable(200, function (screen2) {
    if (display_wave || false) {
        screen2.fillRect(0, scene.screenHeight() / 2 - 45, scene.screenWidth(), 20, 15)
        if (wave_begin) {
            images.printCenter(screen2, "Wave " + wave + " begin!", scene.screenHeight() / 2 - 39, 1)
        } else {
            images.printCenter(screen2, "Wave " + wave + " end!", scene.screenHeight() / 2 - 39, 1)
        }
    }
})
info.onCountdownEnd(function () {
    wave += 1
    display_wave = true
    wave_begin = true
    timer.after(2000, function () {
        display_wave = false
    })
    timer.background(function () {
        for (let index = 0; index <= wave * 10 - 1; index++) {
            summon_bloon(2, 0, Math.idiv(index, 20) + 1, Math.max(wave * 5 * (Math.idiv(index, 10) + 1), 20))
            pause(500)
        }
        if (debug) {
            info.startCountdown(3)
        } else {
            info.startCountdown(10)
        }
        display_wave = true
        wave_begin = false
        timer.after(2000, function () {
            display_wave = false
        })
    })
})
function wait_for_menu_select () {
    menu_option_selected = false
    controller.moveSprite(sprite_cursor, 0, 0)
    while (!(menu_option_selected)) {
        pause(100)
    }
    controller.moveSprite(sprite_cursor, 75, 75)
    blockMenu.closeMenu()
}
function create_cursor () {
    sprite_cursor = sprites.create(img`
        2 . . . . . . . . . 
        f f . . . . . . . . 
        f 1 f . . . . . . . 
        f 1 1 f . . . . . . 
        f 1 1 1 f . . . . . 
        f 1 1 1 1 f . . . . 
        f 1 1 1 1 1 f . . . 
        f 1 1 1 1 1 1 f . . 
        f 1 1 1 1 1 1 1 f . 
        f 1 1 f 1 f f f f f 
        f 1 f f 1 f . . . . 
        f f . . f 1 f . . . 
        f . . . f 1 f . . . 
        . . . . . f 1 f . . 
        . . . . . f 1 f . . 
        . . . . . . f . . . 
        `, SpriteKind.Player)
    controller.moveSprite(sprite_cursor, 75, 75)
    sprite_cursor_pointer = sprites.create(img`
        f 
        `, SpriteKind.Player)
    sprite_cursor.z = 149
    sprite_cursor_pointer.z = 150
    scene.cameraFollowSprite(sprite_cursor)
}
function start_game () {
    if (debug) {
        info.startCountdown(3)
    } else {
        info.startCountdown(10)
    }
}
function set_map_field_of_flowers () {
    tiles.setTilemap(tiles.createTilemap(hex`100010001601020a150a0a0a160a17140a0a0a0a1701040505050505050505050505060a0a0307070707070707070707070402140a0a160a0a0a0a170a0a0a0a1601020a140a0a17140a0a0a0d0e0e0f0a0102170a0905050505060a0c0b0b100a01020a150104070704020a0c0b0b100a01020a0a01020a1601020a13121211140102150a0102140a0102150a0a170a0a01020a1601020a17010405050505050504020a0a0102150a030707070707070707080a1401020a0a140a0a0a150a0a170a0a0a170102160a0a0a170a0a160a0a140a0a0a0104050505050505050505050505050a030707070707070707070707070707160a150a0a0a0a160a0a0a140a0a160a`, img`
        2 . . 2 2 2 2 2 2 2 2 2 2 2 2 2 
        2 . . . . . . . . . . . . . . 2 
        2 . . . . . . . . . . . . . . 2 
        2 2 2 2 2 2 2 2 2 2 2 2 2 . . 2 
        2 2 2 2 2 2 2 2 2 2 2 2 2 . . 2 
        2 . . . . . . 2 2 2 2 2 2 . . 2 
        2 . . . . . . 2 2 2 2 2 2 . . 2 
        2 . . 2 2 . . 2 2 2 2 2 2 . . 2 
        2 . . 2 2 . . 2 2 2 2 2 2 . . 2 
        2 . . 2 2 . . . . . . . . . . 2 
        2 . . 2 2 . . . . . . . . . . 2 
        2 . . 2 2 2 2 2 2 2 2 2 2 2 2 2 
        2 . . 2 2 2 2 2 2 2 2 2 2 2 2 2 
        2 . . . . . . . . . . . . . . . 
        2 . . . . . . . . . . . . . . . 
        2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
        `, [myTiles.transparency16,sprites.castle.tilePath4,sprites.castle.tilePath6,sprites.castle.tilePath7,sprites.castle.tilePath5,sprites.castle.tilePath2,sprites.castle.tilePath3,sprites.castle.tilePath8,sprites.castle.tilePath9,sprites.castle.tilePath1,myTiles.tile1,myTiles.tile2,myTiles.tile3,myTiles.tile4,myTiles.tile5,myTiles.tile6,myTiles.tile7,myTiles.tile8,myTiles.tile9,myTiles.tile10,sprites.castle.tileGrass1,sprites.castle.tileGrass3,sprites.castle.tileGrass2,sprites.builtin.forestTiles0], TileScale.Sixteen))
    bloon_path = scene.aStar(tiles.getTileLocation(2, 0), tiles.getTileLocation(15, 13))
    tiles.setTilemap(tiles.createTilemap(hex`100010001601020a150a0a0a160a17140a0a0a0a1701040505050505050505050505060a0a0307070707070707070707070402140a0a160a0a0a0a170a0a0a0a1601020a140a0a17140a0a0a0d0e0e0f0a0102170a0905050505060a0c0b0b100a01020a150104070704020a0c0b0b100a01020a0a01020a1601020a13121211140102150a0102140a0102150a0a170a0a01020a1601020a17010405050505050504020a0a0102150a030707070707070707080a1401020a0a140a0a0a150a0a170a0a0a170102160a0a0a170a0a160a0a140a0a0a0104050505050505050505050505050a030707070707070707070707070707160a150a0a0a0a160a0a0a140a0a160a`, img`
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        `, [myTiles.transparency16,sprites.castle.tilePath4,sprites.castle.tilePath6,sprites.castle.tilePath7,sprites.castle.tilePath5,sprites.castle.tilePath2,sprites.castle.tilePath3,sprites.castle.tilePath8,sprites.castle.tilePath9,sprites.castle.tilePath1,myTiles.tile1,myTiles.tile2,myTiles.tile3,myTiles.tile4,myTiles.tile5,myTiles.tile6,myTiles.tile7,myTiles.tile8,myTiles.tile9,myTiles.tile10,sprites.castle.tileGrass1,sprites.castle.tileGrass3,sprites.castle.tileGrass2,sprites.builtin.forestTiles0], TileScale.Sixteen))
    scene.setBackgroundColor(7)
}
function bloon_image_from_health (health: number) {
    bloon_images = [img`
        . . . . . . 2 2 2 2 . . . . . . 
        . . . . . 2 2 2 2 2 2 . . . . . 
        . . . . 2 2 2 2 2 2 2 2 . . . . 
        . . . . 2 2 2 2 2 2 2 2 . . . . 
        . . . . 2 2 2 2 2 2 2 2 . . . . 
        . . . . 2 2 2 2 2 2 2 2 . . . . 
        . . . . . 2 2 2 2 2 2 . . . . . 
        . . . . . 2 2 2 2 2 2 . . . . . 
        . . . . . . 2 2 2 2 . . . . . . 
        . . . . . . . 2 2 . . . . . . . 
        . . . . . . . f . . . . . . . . 
        . . . . . . . f . . . . . . . . 
        . . . . . . . . f . . . . . . . 
        . . . . . . . . f . . . . . . . 
        . . . . . . . f . . . . . . . . 
        . . . . . . . f . . . . . . . . 
        `, img`
        . . . . . . 9 9 9 9 . . . . . . 
        . . . . . 9 9 9 9 9 9 . . . . . 
        . . . . 9 9 9 9 9 9 9 9 . . . . 
        . . . . 9 9 9 9 9 9 9 9 . . . . 
        . . . . 9 9 9 9 9 9 9 9 . . . . 
        . . . . 9 9 9 9 9 9 9 9 . . . . 
        . . . . . 9 9 9 9 9 9 . . . . . 
        . . . . . 9 9 9 9 9 9 . . . . . 
        . . . . . . 9 9 9 9 . . . . . . 
        . . . . . . . 9 9 . . . . . . . 
        . . . . . . . f . . . . . . . . 
        . . . . . . . f . . . . . . . . 
        . . . . . . . . f . . . . . . . 
        . . . . . . . . f . . . . . . . 
        . . . . . . . f . . . . . . . . 
        . . . . . . . f . . . . . . . . 
        `, img`
        . . . . . . 7 7 7 7 . . . . . . 
        . . . . . 7 7 7 7 7 7 . . . . . 
        . . . . 7 7 7 7 7 7 7 7 . . . . 
        . . . . 7 7 7 7 7 7 7 7 . . . . 
        . . . . 7 7 7 7 7 7 7 7 . . . . 
        . . . . 7 7 7 7 7 7 7 7 . . . . 
        . . . . . 7 7 7 7 7 7 . . . . . 
        . . . . . 7 7 7 7 7 7 . . . . . 
        . . . . . . 7 7 7 7 . . . . . . 
        . . . . . . . 7 7 . . . . . . . 
        . . . . . . . f . . . . . . . . 
        . . . . . . . f . . . . . . . . 
        . . . . . . . . f . . . . . . . 
        . . . . . . . . f . . . . . . . 
        . . . . . . . f . . . . . . . . 
        . . . . . . . f . . . . . . . . 
        `, img`
        . . . . . . 5 5 5 5 . . . . . . 
        . . . . . 5 5 5 5 5 5 . . . . . 
        . . . . 5 5 5 5 5 5 5 5 . . . . 
        . . . . 5 5 5 5 5 5 5 5 . . . . 
        . . . . 5 5 5 5 5 5 5 5 . . . . 
        . . . . 5 5 5 5 5 5 5 5 . . . . 
        . . . . . 5 5 5 5 5 5 . . . . . 
        . . . . . 5 5 5 5 5 5 . . . . . 
        . . . . . . 5 5 5 5 . . . . . . 
        . . . . . . . 5 5 . . . . . . . 
        . . . . . . . f . . . . . . . . 
        . . . . . . . f . . . . . . . . 
        . . . . . . . . f . . . . . . . 
        . . . . . . . . f . . . . . . . 
        . . . . . . . f . . . . . . . . 
        . . . . . . . f . . . . . . . . 
        `, img`
        . . . . . . 3 3 3 3 . . . . . . 
        . . . . . 3 3 3 3 3 3 . . . . . 
        . . . . 3 3 3 3 3 3 3 3 . . . . 
        . . . . 3 3 3 3 3 3 3 3 . . . . 
        . . . . 3 3 3 3 3 3 3 3 . . . . 
        . . . . 3 3 3 3 3 3 3 3 . . . . 
        . . . . . 3 3 3 3 3 3 . . . . . 
        . . . . . 3 3 3 3 3 3 . . . . . 
        . . . . . . 3 3 3 3 . . . . . . 
        . . . . . . . 3 3 . . . . . . . 
        . . . . . . . f . . . . . . . . 
        . . . . . . . f . . . . . . . . 
        . . . . . . . . f . . . . . . . 
        . . . . . . . . f . . . . . . . 
        . . . . . . . f . . . . . . . . 
        . . . . . . . f . . . . . . . . 
        `]
    if (health - 1 < 0 || health > bloon_images.length) {
        return img`
            . . . . . . d d d c . . . . . . 
            . . . . . d d c d d c . . . . . 
            . . . . c d c c c d c c . . . . 
            . . . . c d c c d d c c . . . . 
            . . . . c c c d d c c c . . . . 
            . . . . c c c d c c c c . . . . 
            . . . . . c c c c c c . . . . . 
            . . . . . c c d c c c . . . . . 
            . . . . . . c c c c . . . . . . 
            . . . . . . . c c . . . . . . . 
            . . . . . . . f . . . . . . . . 
            . . . . . . . f . . . . . . . . 
            . . . . . . . . f . . . . . . . 
            . . . . . . . . f . . . . . . . 
            . . . . . . . f . . . . . . . . 
            . . . . . . . f . . . . . . . . 
            `
    }
    return bloon_images[health - 1]
}
function set_ui_icons () {
    info.setScore(100)
    info.setLife(500)
}
function summon_bloon (col: number, row: number, health: number, speed: number) {
    sprite_bloon = sprites.create(bloon_image_from_health(health), SpriteKind.Enemy)
    tiles.placeOnTile(sprite_bloon, tiles.getTileLocation(col, row))
    sprites.setDataNumber(sprite_bloon, "health", health)
    scene.followPath(sprite_bloon, bloon_path, speed)
}
blockMenu.onMenuOptionSelected(function (option, index) {
    menu_option_selected = true
})
let sprite_bloon: Sprite = null
let bloon_images: Image[] = []
let bloon_path: tiles.Location[] = []
let sprite_cursor: Sprite = null
let menu_option_selected = false
let sprite_tower: Sprite = null
let sprite_cursor_pointer: Sprite = null
let wave_begin = false
let display_wave = false
let wave = 0
let debug = false
debug = true
create_cursor()
set_map_field_of_flowers()
set_ui_icons()
initialize_variables()
start_game()
game.onUpdate(function () {
    sprite_cursor_pointer.top = sprite_cursor.top
    sprite_cursor_pointer.left = sprite_cursor.left
})
