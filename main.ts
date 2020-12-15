namespace SpriteKind {
    export const Tower = SpriteKind.create()
}
function initialize_variables () {
    wave = 0
    display_wave = false
    wave_begin = false
    starting_wave = false
    tower_counter = 0
}
function update_dart_monkey (sprite: Sprite) {
    timer.throttle(convertToText(sprites.readDataNumber(sprite, "tower_id")), sprites.readDataNumber(sprite, "fire_dart_delay"), function () {
        farthest_sprite = get_farthest_among_path_sprite_of_kind(sprite, SpriteKind.Enemy, sprites.readDataNumber(sprite, "tower_distance"))
        if (can_find_farthest_among_path_sprite_of_kind(sprite, SpriteKind.Enemy, sprites.readDataNumber(sprite, "tower_distance"))) {
            projectile = summon_dart(sprites.readDataNumber(sprite, "dart_image_index"), sprite)
            sprites.setDataNumber(projectile, "angle", spriteutils.radiansToDegrees(spriteutils.angleFrom(projectile, farthest_sprite)) - 90)
            if (debug && false) {
                projectile.say(sprites.readDataNumber(projectile, "angle"))
            }
            sprites.setDataNumber(projectile, "dart_health", sprites.readDataNumber(sprite, "dart_health"))
            flip_tower(sprite, sprites.readDataNumber(projectile, "angle"))
            if (sprites.readDataBoolean(sprite, "dart_follow")) {
                projectile.follow(farthest_sprite, sprites.readDataNumber(sprite, "dart_speed"))
            } else {
                spriteutils.setVelocityAtAngle(projectile, spriteutils.angleFrom(projectile, farthest_sprite), sprites.readDataNumber(sprite, "dart_speed"))
            }
        }
    })
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
function overlapping_sprite_of_kind (sprite: Sprite, kind: number) {
    for (let sprite2 of sprites.allOfKind(kind)) {
        if (sprite.overlapsWith(sprite2)) {
            return true
        }
    }
    return false
}
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    if (overlapping_sprite_of_kind(sprite_cursor_pointer, SpriteKind.Tower)) {
        overlapping_sprite = overlapped_sprite_of_kind(sprite_cursor_pointer, SpriteKind.Tower)
        if (sprites.readDataString(overlapping_sprite, "name") == "dart_monkey") {
            dart_monkey_right_click()
        }
        if (sprites.readDataString(overlapping_sprite, "name") == "tack_shooter") {
            tack_shooter_right_click()
        }
    } else {
        blockMenu.setColors(1, 15)
        // https://bloons.fandom.com/wiki/Tower_price_lists#Bloons_TD_5:~:text=%24.-,Bloons%20TD%205
        blockMenu.showMenu(["Cancel", "Dart Monkey", "Tack Shooter"], MenuStyle.List, MenuLocation.BottomHalf)
        wait_for_menu_select()
        if (blockMenu.selectedMenuIndex() == 0) {
        	
        } else if (blockMenu.selectedMenuIndex() == 1 && ((info.score() >= 30 || debug) && (on_valid_land_spot(sprite_cursor_pointer) && !(overlapping_sprite_of_kind(sprite_cursor_pointer, SpriteKind.Tower))))) {
            summon_dart_monkey()
        } else if (blockMenu.selectedMenuIndex() == 2 && ((info.score() >= 50 || debug) && (on_valid_land_spot(sprite_cursor_pointer) && !(overlapping_sprite_of_kind(sprite_cursor_pointer, SpriteKind.Tower))))) {
            summon_tack_shooter()
        } else if (!(on_valid_land_spot(sprite_cursor_pointer))) {
            sprite_cursor_pointer.say("Not on valid spot!", 1000)
        } else {
            sprite_cursor_pointer.say("Not enough money!", 1000)
        }
    }
})
function tack_shooter_right_click () {
    blockMenu.setColors(1, 15)
    tower_options = ["Cancel", "Sell for $" + sprites.readDataNumber(overlapping_sprite, "sell_price")]
    if (sprites.readDataNumber(overlapping_sprite, "fire_dart_delay") > sprites.readDataNumber(overlapping_sprite, "fire_dart_delay_min")) {
        tower_options.push("Decrease firing delay ($50) to " + (sprites.readDataNumber(overlapping_sprite, "fire_dart_delay") - 200) + " ms")
    }
    if (sprites.readDataNumber(overlapping_sprite, "dart_life") < sprites.readDataNumber(overlapping_sprite, "dart_life_max")) {
        tower_options.push("Increase dart life ($30) to " + (sprites.readDataNumber(overlapping_sprite, "dart_life") + 16) + " px")
    }
    blockMenu.showMenu(tower_options, MenuStyle.List, MenuLocation.BottomHalf)
    wait_for_menu_select()
    if (blockMenu.selectedMenuIndex() == 0) {
    	
    } else if (blockMenu.selectedMenuIndex() == 1) {
        info.changeScoreBy(sprites.readDataNumber(overlapping_sprite, "sell_price"))
        overlapping_sprite.destroy()
    } else if (blockMenu.selectedMenuOption().includes("Decrease firing delay") && info.score() >= 50) {
        sprites.changeDataNumberBy(overlapping_sprite, "fire_dart_delay", -100)
        sprites.changeDataNumberBy(overlapping_sprite, "sell_price", 30)
        overlapping_sprite.startEffect(effects.halo, 500)
        change_score(-50)
    } else if (blockMenu.selectedMenuOption().includes("Increase dart life") && info.score() >= 30) {
        sprites.changeDataNumberBy(overlapping_sprite, "dart_life", 200)
        sprites.changeDataNumberBy(overlapping_sprite, "sell_price", 20)
        overlapping_sprite.startEffect(effects.halo, 500)
        change_score(-30)
    } else {
        sprite_cursor_pointer.say("Not enough money!", 1000)
    }
}
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
function overlapped_sprite_of_kind (sprite: Sprite, kind: number) {
    for (let sprite2 of sprites.allOfKind(kind)) {
        if (sprite.overlapsWith(sprite2)) {
            return sprite2
        }
    }
    return sprite
}
function summon_dart (image_index: number, sprite: Sprite) {
    projectile = sprites.createProjectileFromSprite(dart_image_from_index(image_index).clone(), sprite, 0, 0)
    projectile.setFlag(SpriteFlag.AutoDestroy, false)
    projectile.setFlag(SpriteFlag.DestroyOnWall, true)
    return projectile
}
info.onCountdownEnd(function () {
    if (!(starting_wave)) {
        wave += 1
        display_wave = true
        wave_begin = true
        starting_wave = true
        timer.after(2000, function () {
            display_wave = false
        })
        timer.background(function () {
            info.startCountdown(wave * 10 * (Math.max(1000 - wave * 100, 100) / 100))
            for (let index = 0; index <= wave * 10 - 1; index++) {
                summon_bloon(2, 0, Math.idiv(index, 30) + 1, Math.max(wave * 5 * (Math.idiv(index, 20) + 1), 20))
                pause(Math.max(1000 - wave * 100, 100))
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
    } else {
        starting_wave = false
    }
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
function summon_dart_monkey () {
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
    sprites.setDataNumber(sprite_tower, "fire_dart_delay", 1000)
    sprites.setDataNumber(sprite_tower, "fire_dart_delay_min", 200)
    sprites.setDataNumber(sprite_tower, "tower_id", tower_counter)
    sprites.setDataNumber(sprite_tower, "tower_distance", 48)
    sprites.setDataNumber(sprite_tower, "tower_max_distance", 96)
    sprites.setDataString(sprite_tower, "name", "dart_monkey")
    sprites.setDataNumber(sprite_tower, "sell_price", 20)
    sprites.setDataNumber(sprite_tower, "dart_speed", 150)
    sprites.setDataNumber(sprite_tower, "health", 1)
    sprites.setDataBoolean(sprite_tower, "dart_follow", false)
    sprites.setDataBoolean(sprite_tower, "facing_left", true)
    sprites.setDataNumber(sprite_tower, "dart_image_index", 0)
    tower_counter += 1
    change_score(-30)
}
function flip_tower (sprite: Sprite, angle: number) {
    if (angle < -180 || angle > 0) {
        if (!(sprites.readDataBoolean(sprite, "facing_left"))) {
            sprites.setDataBoolean(sprite, "facing_left", true)
            sprite.image.flipX()
        }
    } else {
        if (sprites.readDataBoolean(sprite, "facing_left")) {
            sprites.setDataBoolean(sprite, "facing_left", false)
            sprite.image.flipX()
        }
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
function dart_image_from_index (index: number) {
    dart_images = [img`
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . 5 5 5 5 5 . . . . . . 
        . . . . . . 5 5 5 . . . . . . . 
        . . . . . . . f . . . . . . . . 
        . . . . . . . f . . . . . . . . 
        . . . . . . f f f . . . . . . . 
        . . . . . . f f f . . . . . . . 
        . . . . . . f f f . . . . . . . 
        . . . . . . f f f . . . . . . . 
        . . . . . . . f . . . . . . . . 
        . . . . . . . f . . . . . . . . 
        . . . . . . . f . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        `, img`
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . c c c . . . . . . . 
        . . . . . . . c . . . . . . . . 
        . . . . . . . c . . . . . . . . 
        . . . . . . . c . . . . . . . . 
        . . . . . . . c . . . . . . . . 
        . . . . . . . c . . . . . . . . 
        . . . . . . . c . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        `]
    if (index < 0 || index > dart_images.length - 1) {
        return img`
            . c c c . 
            c c c c c 
            c c c c c 
            c c c c c 
            . c c c . 
            `
    }
    return dart_images[index]
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
function update_tack_shooter (sprite: Sprite) {
    timer.throttle(convertToText(sprites.readDataNumber(sprite, "tower_id")), sprites.readDataNumber(sprite, "fire_dart_delay"), function () {
        for (let index = 0; index <= 7; index++) {
            projectile = summon_dart(sprites.readDataNumber(sprite, "dart_image_index"), sprite)
            sprites.setDataNumber(projectile, "angle", index * 45)
            if (debug && false) {
                projectile.say(sprites.readDataNumber(projectile, "angle"))
            }
            sprites.setDataNumber(projectile, "dart_health", sprites.readDataNumber(sprite, "dart_health"))
            projectile.lifespan = sprites.readDataNumber(sprite, "dart_life")
            flip_tower(sprite, sprites.readDataNumber(projectile, "angle"))
            if (sprites.readDataBoolean(sprite, "dart_follow")) {
                projectile.follow(farthest_sprite, sprites.readDataNumber(sprite, "dart_speed"))
            } else {
                spriteutils.setVelocityAtAngle(projectile, spriteutils.degreesToRadians(sprites.readDataNumber(projectile, "angle") + 90), sprites.readDataNumber(sprite, "dart_speed"))
            }
        }
    })
}
function set_ui_icons () {
    info.setScore(100)
    info.setLife(500)
}
function get_farthest_among_path_sprite_of_kind (sprite: Sprite, kind: number, max_distance: number) {
    progress = 0
    for (let sprite2 of sprites.allOfKind(kind)) {
        if (scene.spritePercentPathCompleted(sprite2) >= progress) {
            if (spriteutils.distanceBetween(sprite, sprite2) <= max_distance || max_distance == 0) {
                sprite_farthest_among_path = sprite2
                progress = scene.spritePercentPathCompleted(sprite2)
            }
        }
    }
    return sprite_farthest_among_path
}
function summon_tack_shooter () {
    sprite_tower = sprites.create(img`
        . . . . . f f f f f f . . . . . 
        . . f f f 3 3 3 3 3 3 f f f . . 
        . f d d d d d d d d d d d d f . 
        . . f f 3 3 3 3 3 3 3 3 f f . . 
        . . . f 3 3 3 3 3 3 3 3 f . . . 
        . . . f c c 3 c c 3 c c f . . . 
        . . f c c c 3 c c 3 c c c f . . 
        . f c c c 3 3 c c 3 3 c c c f . 
        f c c c 3 3 3 c c 3 3 3 c c c f 
        f c c f 3 3 3 c c 3 3 3 f c c f 
        . f f f 3 3 3 c c 3 3 3 f f f . 
        . . . f 3 3 3 3 3 3 3 3 f . . . 
        . . . f 3 3 3 3 3 3 3 3 f . . . 
        . . f f f f f f f f f f f f . . 
        . f c c c c c c c c c c c c f . 
        . . f f f f f f f f f f f f . . 
        `, SpriteKind.Tower)
    sprite_tower.setPosition(sprite_cursor_pointer.x, sprite_cursor_pointer.y)
    sprites.setDataNumber(sprite_tower, "fire_dart_delay", 500)
    sprites.setDataNumber(sprite_tower, "fire_dart_delay_min", 100)
    sprites.setDataNumber(sprite_tower, "tower_id", tower_counter)
    sprites.setDataNumber(sprite_tower, "tower_distance", 32)
    sprites.setDataNumber(sprite_tower, "tower_max_distance", 64)
    sprites.setDataString(sprite_tower, "name", "tack_shooter")
    sprites.setDataNumber(sprite_tower, "sell_price", 35)
    sprites.setDataNumber(sprite_tower, "dart_speed", 200)
    sprites.setDataNumber(sprite_tower, "dart_life", 200)
    sprites.setDataNumber(sprite_tower, "dart_life_max", 2000)
    sprites.setDataNumber(sprite_tower, "health", 1)
    sprites.setDataBoolean(sprite_tower, "dart_follow", false)
    sprites.setDataNumber(sprite_tower, "dart_image_index", 1)
    tower_counter += 1
    change_score(-30)
}
function dart_monkey_right_click () {
    blockMenu.setColors(1, 15)
    tower_options = ["Cancel", "Sell for $" + sprites.readDataNumber(overlapping_sprite, "sell_price")]
    if (sprites.readDataNumber(overlapping_sprite, "fire_dart_delay") > sprites.readDataNumber(overlapping_sprite, "fire_dart_delay_min")) {
        tower_options.push("Decrease firing delay ($50) to " + (sprites.readDataNumber(overlapping_sprite, "fire_dart_delay") - 200) + " ms")
    }
    if (sprites.readDataNumber(overlapping_sprite, "tower_distance") < sprites.readDataNumber(overlapping_sprite, "tower_max_distance")) {
        tower_options.push("Increase visibility ($30) to " + (sprites.readDataNumber(overlapping_sprite, "tower_distance") + 16) + " px")
    }
    blockMenu.showMenu(tower_options, MenuStyle.List, MenuLocation.BottomHalf)
    wait_for_menu_select()
    if (blockMenu.selectedMenuIndex() == 0) {
    	
    } else if (blockMenu.selectedMenuIndex() == 1) {
        info.changeScoreBy(sprites.readDataNumber(overlapping_sprite, "sell_price"))
        overlapping_sprite.destroy()
    } else if (blockMenu.selectedMenuOption().includes("Decrease firing delay") && info.score() >= 50) {
        sprites.changeDataNumberBy(overlapping_sprite, "fire_dart_delay", -200)
        sprites.changeDataNumberBy(overlapping_sprite, "sell_price", 30)
        overlapping_sprite.startEffect(effects.halo, 500)
        change_score(-50)
    } else if (blockMenu.selectedMenuOption().includes("Increase visibility") && info.score() >= 30) {
        sprites.changeDataNumberBy(overlapping_sprite, "tower_distance", 16)
        sprites.changeDataNumberBy(overlapping_sprite, "sell_price", 20)
        overlapping_sprite.startEffect(effects.halo, 500)
        change_score(-30)
    } else {
        sprite_cursor_pointer.say("Not enough money!", 1000)
    }
}
function can_find_farthest_among_path_sprite_of_kind (sprite: Sprite, kind: number, max_distance: number) {
    for (let sprite2 of sprites.allOfKind(kind)) {
        if (scene.spritePercentPathCompleted(sprite2) >= progress) {
            if (spriteutils.distanceBetween(sprite, sprite2) <= max_distance || max_distance == 0) {
                return true
            }
        }
    }
    return false
}
function change_score (diff: number) {
    if (!(debug)) {
        info.changeScoreBy(diff)
    }
}
function summon_bloon (col: number, row: number, health: number, speed: number) {
    sprite_bloon = sprites.create(bloon_image_from_health(health), SpriteKind.Enemy)
    tiles.placeOnTile(sprite_bloon, tiles.getTileLocation(col, row))
    sprites.setDataNumber(sprite_bloon, "health", health)
    sprites.setDataNumber(sprite_bloon, "original_health", health)
    scene.followPath(sprite_bloon, bloon_path, speed)
}
blockMenu.onMenuOptionSelected(function (option, index) {
    menu_option_selected = true
})
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Enemy, function (sprite, otherSprite) {
    sprites.changeDataNumberBy(otherSprite, "health", -1)
    sprites.changeDataNumberBy(sprite, "health", -1)
    if (sprites.readDataNumber(otherSprite, "health") <= 0) {
        info.changeScoreBy(sprites.readDataNumber(otherSprite, "original_health"))
        otherSprite.destroy()
    } else {
        otherSprite.setImage(bloon_image_from_health(sprites.readDataNumber(otherSprite, "health")))
    }
    if (sprites.readDataNumber(sprite, "health") <= 0) {
        sprite.destroy()
    }
})
let sprite_bloon: Sprite = null
let sprite_farthest_among_path: Sprite = null
let progress = 0
let bloon_images: Image[] = []
let dart_images: Image[] = []
let bloon_path: tiles.Location[] = []
let sprite_tower: Sprite = null
let sprite_cursor: Sprite = null
let menu_option_selected = false
let tower_options: string[] = []
let overlapping_sprite: Sprite = null
let sprite_cursor_pointer: Sprite = null
let projectile: Sprite = null
let farthest_sprite: Sprite = null
let tower_counter = 0
let starting_wave = false
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
forever(function () {
    for (let sprite of sprites.allOfKind(SpriteKind.Projectile)) {
        if (sprites.readDataString(sprite, "name") != "tack_shooter") {
            transformSprites.rotateSprite(sprite, sprites.readDataNumber(sprite, "angle"))
        }
    }
})
forever(function () {
    if (overlapping_sprite_of_kind(sprite_cursor_pointer, SpriteKind.Tower)) {
        sprite_cursor.setImage(img`
            2 . . . . . . . . . 
            f f . . . . . . . . 
            f 9 f . . . . . . . 
            f 9 9 f . . . . . . 
            f 9 9 9 f . . . . . 
            f 9 9 9 9 f . . . . 
            f 9 9 9 9 9 f . . . 
            f 9 9 9 9 9 9 f . . 
            f 9 9 9 9 9 9 9 f . 
            f 9 9 f 9 f f f f f 
            f 9 f f 9 f . . . . 
            f f . . f 9 f . . . 
            f . . . f 9 f . . . 
            . . . . . f 9 f . . 
            . . . . . f 9 f . . 
            . . . . . . f . . . 
            `)
    } else {
        sprite_cursor.setImage(img`
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
            `)
    }
})
forever(function () {
    for (let sprite of sprites.allOfKind(SpriteKind.Tower)) {
        if (sprites.readDataString(sprite, "name") == "dart_monkey") {
            update_dart_monkey(sprite)
        } else if (sprites.readDataString(sprite, "name") == "tack_shooter") {
            update_tack_shooter(sprite)
        }
    }
})
