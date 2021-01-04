namespace SpriteKind {
    export const Tower = SpriteKind.create()
}
function initialize_variables () {
    wave = 0
    display_wave = false
    wave_begin = false
    starting_wave = false
    menu_open = false
    tower_counter = 0
}
function update_sniper_monkey (sprite: Sprite) {
    timer.throttle(convertToText(sprites.readDataNumber(sprite, "tower_id")), sprites.readDataNumber(sprite, "fire_dart_delay"), function () {
        for (let index = 0; index < sprites.readDataNumber(sprite, "darts_shot"); index++) {
            farthest_sprite = get_farthest_among_path_sprite_of_kind(sprite, SpriteKind.Enemy, sprites.readDataNumber(sprite, "tower_distance"))
            if (can_find_farthest_among_path_sprite_of_kind(sprite, SpriteKind.Enemy, sprites.readDataNumber(sprite, "tower_distance"))) {
                projectile = summon_dart(sprites.readDataNumber(sprite, "dart_image_index"), sprite)
                sprites.setDataNumber(projectile, "angle", spriteutils.radiansToDegrees(spriteutils.angleFrom(projectile, farthest_sprite)) - 90)
                projectile.setFlag(SpriteFlag.Invisible, !(debug) && true)
                transformSprites.rotateSprite(projectile, sprites.readDataNumber(projectile, "angle"))
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
        }
    })
}
function update_dart_monkey (sprite: Sprite) {
    timer.throttle(convertToText(sprites.readDataNumber(sprite, "tower_id")), sprites.readDataNumber(sprite, "fire_dart_delay"), function () {
        farthest_sprite = get_farthest_among_path_sprite_of_kind(sprite, SpriteKind.Enemy, sprites.readDataNumber(sprite, "tower_distance"))
        if (can_find_farthest_among_path_sprite_of_kind(sprite, SpriteKind.Enemy, sprites.readDataNumber(sprite, "tower_distance"))) {
            projectile = summon_dart(sprites.readDataNumber(sprite, "dart_image_index"), sprite)
            sprites.setDataNumber(projectile, "angle", spriteutils.radiansToDegrees(spriteutils.angleFrom(projectile, farthest_sprite)) - 90)
            transformSprites.rotateSprite(projectile, sprites.readDataNumber(projectile, "angle"))
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
    for (let tile of land_tiles) {
        if (sprite.tileKindAt(TileDirection.Center, tile)) {
            return true
        }
    }
    return false
}
function sniper_monkey_right_click () {
    blockMenu.setColors(1, 15)
    tower_options = ["Cancel", "Sell for $" + sprites.readDataNumber(overlapping_sprite, "sell_price")]
    if (sprites.readDataNumber(overlapping_sprite, "fire_dart_delay") > sprites.readDataNumber(overlapping_sprite, "fire_dart_delay_min")) {
        tower_options.push("Decrease firing delay ($50) to " + (sprites.readDataNumber(overlapping_sprite, "fire_dart_delay") - 250) + " ms")
    }
    if (sprites.readDataNumber(overlapping_sprite, "dart_health") < sprites.readDataNumber(overlapping_sprite, "dart_health_max")) {
        tower_options.push("Increase bullet durability ($30) to " + (sprites.readDataNumber(overlapping_sprite, "dart_health") + 1) + " px")
    }
    if (sprites.readDataNumber(overlapping_sprite, "darts_shot") < sprites.readDataNumber(overlapping_sprite, "darts_shot_max")) {
        tower_options.push("Increase bullets shot ($60) to " + (sprites.readDataNumber(overlapping_sprite, "darts_shot") + 1) + " bullets")
    }
    blockMenu.showMenu(tower_options, MenuStyle.List, MenuLocation.BottomHalf)
    wait_for_menu_select()
    if (blockMenu.selectedMenuIndex() == 0) {
    	
    } else if (blockMenu.selectedMenuIndex() == 1) {
        info.changeScoreBy(sprites.readDataNumber(overlapping_sprite, "sell_price"))
        overlapping_sprite.destroy()
    } else if (blockMenu.selectedMenuOption().includes("Decrease firing delay") && info.score() >= 50) {
        sprites.changeDataNumberBy(overlapping_sprite, "fire_dart_delay", -250)
        sprites.changeDataNumberBy(overlapping_sprite, "sell_price", 30)
        overlapping_sprite.startEffect(effects.halo, 1000)
        change_score(-50)
    } else if (blockMenu.selectedMenuOption().includes("Increase bullet durability") && info.score() >= 30) {
        sprites.changeDataNumberBy(overlapping_sprite, "dart_health", 1)
        sprites.changeDataNumberBy(overlapping_sprite, "sell_price", 20)
        overlapping_sprite.startEffect(effects.halo, 1000)
        change_score(-30)
    } else if (blockMenu.selectedMenuOption().includes("Increase bullets shot") && info.score() >= 60) {
        sprites.changeDataNumberBy(overlapping_sprite, "darts_shot", 1)
        sprites.changeDataNumberBy(overlapping_sprite, "sell_price", 45)
        overlapping_sprite.startEffect(effects.halo, 1000)
        change_score(-60)
    } else {
        sprite_cursor_pointer.say("Not enough money!", 1000)
    }
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
    if (!(menu_open)) {
        timer.background(function () {
            if (overlapping_sprite_of_kind(sprite_cursor_pointer, SpriteKind.Tower)) {
                overlapping_sprite = overlapped_sprite_of_kind(sprite_cursor_pointer, SpriteKind.Tower)
                if (sprites.readDataString(overlapping_sprite, "name") == "dart_monkey") {
                    dart_monkey_right_click()
                } else if (sprites.readDataString(overlapping_sprite, "name") == "tack_shooter") {
                    tack_shooter_right_click()
                } else if (sprites.readDataString(overlapping_sprite, "name") == "sniper_monkey") {
                    sniper_monkey_right_click()
                }
            } else {
                blockMenu.setColors(1, 15)
                // https://bloons.fandom.com/wiki/Tower_price_lists#Bloons_TD_5:~:text=%24.-,Bloons%20TD%205
                blockMenu.showMenu(["Cancel", "Dart Monkey ($30)", "Tack Shooter ($50)", "Sniper Monkey ($40)"], MenuStyle.List, MenuLocation.BottomHalf)
                wait_for_menu_select()
                if (blockMenu.selectedMenuIndex() == 0) {
                	
                } else if (blockMenu.selectedMenuIndex() == 1 && ((info.score() >= 30 || debug) && (on_valid_land_spot(sprite_cursor_pointer) && !(overlapping_sprite_of_kind(sprite_cursor_pointer, SpriteKind.Tower))))) {
                    summon_dart_monkey()
                } else if (blockMenu.selectedMenuIndex() == 2 && ((info.score() >= 50 || debug) && (on_valid_land_spot(sprite_cursor_pointer) && !(overlapping_sprite_of_kind(sprite_cursor_pointer, SpriteKind.Tower))))) {
                    summon_tack_shooter()
                } else if (blockMenu.selectedMenuIndex() == 3 && ((info.score() >= 40 || debug) && (on_valid_land_spot(sprite_cursor_pointer) && !(overlapping_sprite_of_kind(sprite_cursor_pointer, SpriteKind.Tower))))) {
                    summon_sniper_monkey()
                } else if (!(on_valid_land_spot(sprite_cursor_pointer))) {
                    sprite_cursor_pointer.say("Not on valid spot!", 1000)
                } else {
                    sprite_cursor_pointer.say("Not enough money!", 1000)
                }
            }
        })
    }
})
function tack_shooter_right_click () {
    blockMenu.setColors(1, 15)
    tower_options = ["Cancel", "Sell for $" + sprites.readDataNumber(overlapping_sprite, "sell_price")]
    if (sprites.readDataNumber(overlapping_sprite, "fire_dart_delay") > sprites.readDataNumber(overlapping_sprite, "fire_dart_delay_min")) {
        tower_options.push("Decrease firing delay ($50) to " + (sprites.readDataNumber(overlapping_sprite, "fire_dart_delay") - 200) + " ms")
    }
    if (sprites.readDataNumber(overlapping_sprite, "dart_count") < sprites.readDataNumber(overlapping_sprite, "dart_count_max")) {
        tower_options.push("Increase tacks shot ($70) to " + (sprites.readDataNumber(overlapping_sprite, "dart_count") + 2) + " tacks")
    }
    if (sprites.readDataNumber(overlapping_sprite, "dart_health") < sprites.readDataNumber(overlapping_sprite, "dart_health_max")) {
        tower_options.push("Increase dart durability ($40) to " + (sprites.readDataNumber(overlapping_sprite, "dart_health") + 1) + " Bloons")
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
        overlapping_sprite.startEffect(effects.halo, 1000)
        change_score(-50)
    } else if (blockMenu.selectedMenuOption().includes("Increase tacks shot") && info.score() >= 70) {
        sprites.changeDataNumberBy(overlapping_sprite, "dart_count", 2)
        sprites.changeDataNumberBy(overlapping_sprite, "sell_price", 45)
        overlapping_sprite.startEffect(effects.halo, 1000)
        change_score(-70)
    } else if (blockMenu.selectedMenuOption().includes("Increase dart durability") && info.score() >= 40) {
        sprites.changeDataNumberBy(overlapping_sprite, "dart_health", 1)
        sprites.changeDataNumberBy(overlapping_sprite, "sell_price", 30)
        overlapping_sprite.startEffect(effects.halo, 1000)
        change_score(-40)
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
function summon_sniper_monkey () {
    sprite_tower = sprites.create(img`
        ......................
        ......................
        ......ffffffff........
        ....ffee77e777ff......
        ..ff7ee77eee7eeef.....
        .fee7777ee777eee7f....
        ..ffcdfddfdeeffff.....
        ....cdfddfdeeddf......
        ...cdeeddddfffdc......
        ...cddddcdfccfdc......
        ...cccccdfcccfcfffff..
        ....fddffffffffcccccf.
        ..fffffccccccccccccccf
        .fccccccccccccccccccf.
        .fcccfffffcccccfffff..
        .fcccfdbfeffffff.ef...
        ..ffffddfeeeeeeffef...
        ....ffffffeeeeeffff...
        .....fffffffffffff....
        ......................
        ......................
        ......................
        `, SpriteKind.Tower)
    sprite_tower.setPosition(sprite_cursor_pointer.x, sprite_cursor_pointer.y)
    sprites.setDataNumber(sprite_tower, "fire_dart_delay", 2000)
    sprites.setDataNumber(sprite_tower, "fire_dart_delay_min", 250)
    sprites.setDataNumber(sprite_tower, "tower_id", tower_counter)
    sprites.setDataNumber(sprite_tower, "tower_distance", 0)
    sprites.setDataString(sprite_tower, "name", "sniper_monkey")
    sprites.setDataNumber(sprite_tower, "sell_price", 30)
    sprites.setDataNumber(sprite_tower, "dart_speed", 500)
    sprites.setDataNumber(sprite_tower, "dart_health", 2)
    sprites.setDataNumber(sprite_tower, "dart_health_max", 6)
    sprites.setDataNumber(sprite_tower, "darts_shot", 1)
    sprites.setDataNumber(sprite_tower, "darts_shot_max", 3)
    sprites.setDataBoolean(sprite_tower, "dart_follow", false)
    sprites.setDataBoolean(sprite_tower, "facing_left", true)
    sprites.setDataNumber(sprite_tower, "dart_image_index", 2)
    tower_counter += 1
    change_score(-30)
}
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
function on_valid_water_spot (sprite: Sprite) {
    for (let tile of water_tiles) {
        if (sprite.tileKindAt(TileDirection.Center, tile)) {
            return true
        }
    }
    return false
}
function fade_out (time: number, block: boolean) {
    color.startFade(color.Black, color.originalPalette, time)
    if (block) {
        color.pauseUntilFadeDone()
    }
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
            if (wave / 3 == Math.idiv(wave, 3)) {
                info.startCountdown(wave * 10 * (50 / 1000))
            } else {
                info.startCountdown(wave * 10 * (Math.max(1000 - wave * 100, 100) / 1000))
            }
            for (let index = 0; index <= wave * 10 - 1; index++) {
                bloon_path = randint(0, bloon_paths.length - 1)
                console.log(Math.min(Math.idiv(index, 30) + 1, bloon_images.length - 1))
                summon_bloon(start_x, start_y, Math.idiv(index, 30) + 1, Math.max(wave * 5 * (Math.idiv(index, 20) + 1), 20), bloon_path)
                console.log(wave / 3 == Math.idiv(wave, 3))
                if (wave / 3 == Math.idiv(wave, 3)) {
                    pause(50)
                } else {
                    pause(Math.max(1000 - wave * 100, 50))
                }
            }
            timer.background(function () {
                for (let index = 0; index < Math.min(wave * 5 / 2, 50); index++) {
                    info.changeScoreBy(2)
                    pause(50)
                }
            })
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
function fade_in (time: number, block: boolean) {
    color.startFade(color.originalPalette, color.Black, time)
    if (block) {
        color.pauseUntilFadeDone()
    }
}
function wait_for_menu_select () {
    menu_option_selected = false
    menu_open = true
    controller.moveSprite(sprite_cursor, 0, 0)
    while (!(menu_option_selected)) {
        pause(100)
    }
    controller.moveSprite(sprite_cursor, 75, 75)
    menu_open = false
    blockMenu.closeMenu()
}
function set_map_sand_castle () {
    bloon_paths = []
    start_x = 0
    start_y = 1
    land_tiles = [sprites.castle.tilePath5, myTiles.tile16, myTiles.tile17]
    water_tiles = [myTiles.tile2]
    for (let tilemap2 of [tiles.createMap(tiles.createTilemap(hex`10000c0001010104070708050104070707050101020606060b0b0b0501040708070501010101010407090b0606060b0b0b050101010101040807070501040a070b05010101010104070b0b0606060b0b0b05010101010104090b0705010407070705010101010104070b0b0606060b0b0705010101010104070707050104070b08050101010101040b0b0b0606060b0b07050101010101040b0a07050104070707050101010101040b0b0b0606060b0b0b06060301010104080707050104070707050101`, img`
        2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
        . . . . . . . 2 2 2 2 2 2 2 2 2 
        2 2 2 2 2 2 . . . . . . . 2 2 2 
        2 2 2 2 2 2 2 2 2 2 2 2 . 2 2 2 
        2 2 2 2 2 . . . . . . . . 2 2 2 
        2 2 2 2 2 . 2 2 2 2 2 2 2 2 2 2 
        2 2 2 2 2 . . . . . . . 2 2 2 2 
        2 2 2 2 2 2 2 2 2 2 2 . 2 2 2 2 
        2 2 2 2 . . . . . . . . 2 2 2 2 
        2 2 2 2 . 2 2 2 2 2 2 2 2 2 2 2 
        2 2 2 2 . . . . . . . . . . . . 
        2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
        `, [myTiles.transparency16,myTiles.tile2,myTiles.tile11,myTiles.tile12,myTiles.tile16,myTiles.tile17,myTiles.tile18,sprites.castle.tilePath5,sprites.castle.rock2,sprites.castle.rock1,sprites.castle.rock0,myTiles.tile19], TileScale.Sixteen))]) {
        tiles.loadMap(tilemap2)
        bloon_paths.push(scene.aStar(tiles.getTilesByType(myTiles.tile11)[0], tiles.getTilesByType(myTiles.tile12)[0]))
    }
    tiles.setTilemap(tiles.createTilemap(hex`10000c00010101040202080501040202020501010606060609090905010402080205010101010104020709060606090909050101010101040802020501040302090501010101010402090906060609090905010101010104070902050104020202050101010101040209090606060909020501010101010402020205010402090805010101010104090909060606090902050101010101040903020501040202020501010101010409090906060609090906060601010104080202050104020202050101`, img`
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
        `, [myTiles.transparency16,myTiles.tile2,sprites.castle.tilePath5,sprites.castle.rock0,myTiles.tile16,myTiles.tile17,myTiles.tile18,sprites.castle.rock1,sprites.castle.rock2,myTiles.tile19], TileScale.Sixteen))
    scene.setBackgroundColor(13)
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
    sprites.setDataNumber(sprite_tower, "dart_health", 1)
    sprites.setDataNumber(sprite_tower, "dart_health_max", 5)
    sprites.setDataBoolean(sprite_tower, "dart_follow", false)
    sprites.setDataBoolean(sprite_tower, "facing_left", true)
    sprites.setDataNumber(sprite_tower, "dart_image_index", 0)
    tower_counter += 1
    change_score(-30)
}
function get_strongest_among_path_sprite_of_kind (sprite: Sprite, kind: number, max_distance: number) {
    strength = 0
    for (let sprite2 of sprites.allOfKind(kind)) {
        if (sprites.readDataNumber(sprite2, "health") >= strength) {
            if (spriteutils.distanceBetween(sprite, sprite2) <= max_distance || max_distance == 0) {
                sprite_farthest_among_path = sprite2
                strength = sprites.readDataNumber(sprite2, "health")
            }
        }
    }
    return sprite_farthest_among_path
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
function set_map_figure_eights () {
    bloon_paths = []
    start_x = 0
    start_y = 1
    land_tiles = [myTiles.tile1, sprites.castle.tileGrass1, sprites.castle.tileGrass3, sprites.castle.tileGrass2]
    water_tiles = [
    myTiles.tile2,
    myTiles.tile3,
    myTiles.tile4,
    myTiles.tile6,
    myTiles.tile7,
    myTiles.tile8,
    myTiles.tile9,
    myTiles.tile10
    ]
    for (let tilemap2 of [tiles.createMap(tiles.createTilemap(hex`10000c000503010102010301010201030104010206090809080908090808080809081001010a010a020a040a141516030a050a01010b080f010b080f131217040b080f03010a020a010a010a1a1918020a010a01040c080e080e080e080808080e080f0101020101040103050101020304010a02030d0809080908090808080809080f01010a050a020a050a021415160a020a03010a020a010a010a031a19180a010a01070e080e080e080e080808080e08110101050101030201010103040101030104`, img`
        2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
        . . . . 2 . . . . . . . . . . 2 
        2 2 2 . 2 . 2 2 2 2 2 2 2 2 . 2 
        2 . . . 2 . . . 2 2 2 2 . . . 2 
        2 . 2 2 2 2 2 . 2 2 2 2 . 2 2 2 
        2 . . . . . . . 2 2 2 2 . . . 2 
        2 2 2 2 2 2 2 2 2 2 2 2 2 2 . 2 
        2 2 2 . . . 2 . . . . . . 2 . 2 
        2 2 2 . 2 . 2 . 2 2 2 2 . 2 . 2 
        2 2 2 . 2 . 2 . 2 2 2 2 . 2 . 2 
        . . . . 2 . . . 2 2 2 2 . . . 2 
        2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
        `, [myTiles.transparency16,myTiles.tile1,sprites.castle.tileGrass2,sprites.builtin.forestTiles0,sprites.castle.tileGrass1,sprites.castle.tileGrass3,myTiles.tile11,myTiles.tile12,sprites.vehicle.roadHorizontal,sprites.vehicle.roadIntersection3,sprites.vehicle.roadVertical,sprites.vehicle.roadIntersection2,sprites.vehicle.roadTurn3,sprites.vehicle.roadTurn1,sprites.vehicle.roadIntersection1,sprites.vehicle.roadIntersection4,sprites.vehicle.roadTurn2,sprites.vehicle.roadTurn4,myTiles.tile2,myTiles.tile3,myTiles.tile4,myTiles.tile5,myTiles.tile6,myTiles.tile7,myTiles.tile8,myTiles.tile9,myTiles.tile10], TileScale.Sixteen)), tiles.createMap(tiles.createTilemap(hex`10000c000503010102010301010201030104010206090809080908090808080809081001010a010a020a040a141516030a050a01010b080f010b080f131217040b080f03010a020a010a010a1a1918020a010a01040c080e080e080e080808080e080f0101020101040103050101020304010a02030d0809080908090808080809080f01010a050a020a050a021415160a020a03010a020a010a010a031a19180a010a01070e080e080e080e080808080e08110101050101030201010103040101030104`, img`
        2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
        . . 2 . . . . . 2 2 2 2 . . . 2 
        2 . 2 . 2 2 2 . 2 2 2 2 . 2 . 2 
        2 . 2 . 2 . . . 2 2 2 2 . 2 . 2 
        2 . 2 . 2 . 2 2 2 2 2 2 . 2 . 2 
        2 . . . 2 . . . . . . . . 2 . 2 
        2 2 2 2 2 2 2 2 2 2 2 2 2 2 . 2 
        2 . . . 2 . . . 2 2 2 2 . . . 2 
        2 . 2 . 2 . 2 . 2 2 2 2 . 2 2 2 
        2 . 2 . 2 . 2 . 2 2 2 2 . 2 2 2 
        . . 2 . . . 2 . . . . . . 2 2 2 
        2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
        `, [myTiles.transparency16,myTiles.tile1,sprites.castle.tileGrass2,sprites.builtin.forestTiles0,sprites.castle.tileGrass1,sprites.castle.tileGrass3,myTiles.tile11,myTiles.tile12,sprites.vehicle.roadHorizontal,sprites.vehicle.roadIntersection3,sprites.vehicle.roadVertical,sprites.vehicle.roadIntersection2,sprites.vehicle.roadTurn3,sprites.vehicle.roadTurn1,sprites.vehicle.roadIntersection1,sprites.vehicle.roadIntersection4,sprites.vehicle.roadTurn2,sprites.vehicle.roadTurn4,myTiles.tile2,myTiles.tile3,myTiles.tile4,myTiles.tile5,myTiles.tile6,myTiles.tile7,myTiles.tile8,myTiles.tile9,myTiles.tile10], TileScale.Sixteen))]) {
        tiles.loadMap(tilemap2)
        bloon_paths.push(scene.aStar(tiles.getTilesByType(myTiles.tile11)[0], tiles.getTilesByType(myTiles.tile12)[0]))
    }
    tiles.setTilemap(tiles.createTilemap(hex`10000c000305010104010501010401050102010407080708070807080707070708070e01010601060406020612131405060306010109070a0109070a1110150209070a0501060406010601061817160406010601020b070c070c070c070707070c070a0101040101020105030101040502010604050f0708070807080707070708070a010106030604060306041213140604060501060406010601060518171606010601070c070c070c070c070707070c070d0101030101050401010105020101050102`, img`
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
        `, [myTiles.transparency16,myTiles.tile1,sprites.castle.tileGrass1,sprites.castle.tileGrass3,sprites.castle.tileGrass2,sprites.builtin.forestTiles0,sprites.vehicle.roadVertical,sprites.vehicle.roadHorizontal,sprites.vehicle.roadIntersection3,sprites.vehicle.roadIntersection2,sprites.vehicle.roadIntersection4,sprites.vehicle.roadTurn3,sprites.vehicle.roadIntersection1,sprites.vehicle.roadTurn4,sprites.vehicle.roadTurn2,sprites.vehicle.roadTurn1,myTiles.tile2,myTiles.tile3,myTiles.tile4,myTiles.tile5,myTiles.tile6,myTiles.tile7,myTiles.tile8,myTiles.tile9,myTiles.tile10], TileScale.Sixteen))
    scene.setBackgroundColor(7)
}
function set_map_field_of_flowers () {
    bloon_paths = []
    start_x = 13
    start_y = 0
    land_tiles = [myTiles.tile1, sprites.castle.tileGrass1, sprites.castle.tileGrass3, sprites.castle.tileGrass2]
    water_tiles = []
    for (let tilemap2 of [tiles.createMap(tiles.createTilemap(hex`10000c00050101040102010102010101010e090101080c0c0c0c0c0c0c0c10010206090402060a0b0b0b0b0b0b0a09050106090101060903010201010106090101060901040609010101010403060901010609010106090201080c0c0c0a0902010609020206090101060a0b0b0b0d010106090101060904010609020102010101060901010609010206090101010104030609010106090101060a0c0c0c0c0c0c0a09050406090102070b0b0b0b0b0b0b0b0d0102060f01010104010101020101020101`, img`
        2 2 2 2 2 2 2 2 2 2 2 2 2 . 2 2 
        2 2 2 2 2 2 2 2 2 2 2 2 2 . 2 2 
        2 2 . . . . . . . . . 2 2 . 2 2 
        2 2 . 2 2 2 2 2 2 2 . 2 2 . 2 2 
        2 2 . 2 2 2 2 2 2 2 . 2 2 . 2 2 
        2 2 . 2 2 2 2 2 2 2 . 2 2 . 2 2 
        2 2 . 2 2 2 . . . . . 2 2 . 2 2 
        2 2 . 2 2 2 . 2 2 2 2 2 2 . 2 2 
        2 2 . 2 2 2 . 2 2 2 2 2 2 . 2 2 
        2 2 . 2 2 2 . . . . . . . . 2 2 
        2 2 . 2 2 2 2 2 2 2 2 2 2 2 2 2 
        2 2 . 2 2 2 2 2 2 2 2 2 2 2 2 2 
        `, [myTiles.transparency16,myTiles.tile1,sprites.castle.tileGrass2,sprites.builtin.forestTiles0,sprites.castle.tileGrass1,sprites.castle.tileGrass3,sprites.castle.tilePath4,sprites.castle.tilePath7,sprites.castle.tilePath1,sprites.castle.tilePath6,sprites.castle.tilePath5,sprites.castle.tilePath8,sprites.castle.tilePath2,sprites.castle.tilePath9,myTiles.tile11,myTiles.tile12,sprites.castle.tilePath3], TileScale.Sixteen))]) {
        tiles.loadMap(tilemap2)
        bloon_paths.push(scene.aStar(tiles.getTilesByType(myTiles.tile11)[0], tiles.getTilesByType(myTiles.tile12)[0]))
    }
    tiles.setTilemap(tiles.createTilemap(hex`10000c000b09090a090c09090c09090909010209090805050505050505050e090c01020a0c010406060606060604020b090102090901020d090c090909010209090102090a0102090909090a0d010209090102090901020c090805050504020c0901020c0c0102090901040606060709090102090901020a0901020c090c090909010209090102090c0102090909090a0d0102090901020909010405050505050504020b0a0102090c03060606060606060607090c01020909090a0909090c09090c0909`, img`
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
        `, [myTiles.transparency16,sprites.castle.tilePath4,sprites.castle.tilePath6,sprites.castle.tilePath7,sprites.castle.tilePath5,sprites.castle.tilePath2,sprites.castle.tilePath8,sprites.castle.tilePath9,sprites.castle.tilePath1,myTiles.tile1,sprites.castle.tileGrass1,sprites.castle.tileGrass3,sprites.castle.tileGrass2,sprites.builtin.forestTiles0,sprites.castle.tilePath3], TileScale.Sixteen))
    scene.setBackgroundColor(7)
}
function can_find_strongest_among_path_sprite_of_kind (sprite: Sprite, kind: number, max_distance: number) {
    for (let sprite2 of sprites.allOfKind(kind)) {
        if (spriteutils.distanceBetween(sprite, sprite2) <= max_distance || max_distance == 0) {
            return true
        }
    }
    return false
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
        `, img`
        f f 
        f f 
        `]
    return dart_images[Math.constrain(index, 0, dart_images.length - 1)]
}
function set_map_dark_dungeon () {
    bloon_paths = []
    start_x = 5
    start_y = 0
    land_tiles = [
    sprites.dungeon.darkGroundCenter,
    sprites.dungeon.darkGroundNorthWest1,
    sprites.dungeon.darkGroundEast,
    sprites.dungeon.darkGroundSouthWest1,
    sprites.dungeon.darkGroundSouth,
    sprites.dungeon.darkGroundNorth,
    sprites.dungeon.darkGroundNorthEast1,
    sprites.dungeon.darkGroundWest,
    sprites.dungeon.darkGroundSouthEast1
    ]
    water_tiles = [sprites.dungeon.hazardLava0, sprites.dungeon.hazardLava1]
    for (let tilemap2 of [tiles.createMap(tiles.createTilemap(hex`10000c0003080b11130114080b13021411080b1f04090909090e1518181c0d090909092005090909090d16191a1d0e090909092106090c0e0f0e161a191d0d0c0e0e092205090d09090916191a1d0909090d092104090e0f0c0e161a191d0e0e0f0e092105090909090e16191a1d0d090909092004090c0e0e0d161a191d0e0e0c0e092106090f090909171b1b1e0909090d092205090e0d0e0e0f0c0d0f0e0e0e0f092104090909090909090909090909090920070a10120a0a0a100a101010120a1023`, img`
        2 2 2 2 2 . 2 2 2 2 . 2 2 2 2 2 
        2 2 2 2 2 . 2 2 2 2 . 2 2 2 2 2 
        2 2 2 2 2 . 2 2 2 2 . 2 2 2 2 2 
        2 2 . . . . 2 2 2 2 . . . . 2 2 
        2 2 . 2 2 2 2 2 2 2 2 2 2 . 2 2 
        2 2 . . . . 2 2 2 2 . . . . 2 2 
        2 2 2 2 2 . 2 2 2 2 . 2 2 2 2 2 
        2 2 . . . . 2 2 2 2 . . . . 2 2 
        2 2 . 2 2 2 2 2 2 2 2 2 2 . 2 2 
        2 2 . . . . . . . . . . . . 2 2 
        2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
        2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
        `, [myTiles.transparency16,myTiles.tile11,myTiles.tile12,sprites.dungeon.greenOuterNorthWest,sprites.dungeon.greenOuterWest0,sprites.dungeon.greenOuterWest1,sprites.dungeon.greenOuterWest2,sprites.dungeon.greenOuterSouthEast,sprites.dungeon.greenOuterNorth0,sprites.dungeon.darkGroundCenter,sprites.dungeon.greenOuterSouth1,sprites.dungeon.greenOuterNorth1,sprites.dungeon.floorDark3,sprites.dungeon.floorDark1,sprites.dungeon.floorDark0,sprites.dungeon.floorDark4,sprites.dungeon.greenOuterSouth0,sprites.dungeon.greenOuterNorth2,sprites.dungeon.greenOuterSouth2,sprites.dungeon.greenInnerSouthEast,sprites.dungeon.greenInnerSouthWest,sprites.dungeon.darkGroundNorthWest1,sprites.dungeon.darkGroundEast,sprites.dungeon.darkGroundSouthWest1,sprites.dungeon.darkGroundSouth,sprites.dungeon.hazardLava0,sprites.dungeon.hazardLava1,sprites.dungeon.darkGroundNorth,sprites.dungeon.darkGroundNorthEast1,sprites.dungeon.darkGroundWest,sprites.dungeon.darkGroundSouthEast1,sprites.dungeon.greenOuterNorthEast,sprites.dungeon.greenOuterEast0,sprites.dungeon.greenOuterEast1,sprites.dungeon.greenOuterEast2,sprites.dungeon.greenOuterSouthWest], TileScale.Sixteen))]) {
        tiles.loadMap(tilemap2)
        bloon_paths.push(scene.aStar(tiles.getTilesByType(myTiles.tile11)[0], tiles.getTilesByType(myTiles.tile12)[0]))
    }
    tiles.setTilemap(tiles.createTilemap(hex`10000c000203040e12161303041215130e0304050d01010101151b1c1c1d1601010101060c010101011614191a1e150101010107110118151715141a191e16181515010f0c011601010114191a1e0101011601070d0115171815141a191e1515171501070c010101011514191a1e1601010101060d0118151516141a191e151518150107110117010101211f1f2001010116010f0c0115161515171816171515151701070d010101010101010101010101010106090a0b100a0a0a0b0a0b0b0b100a0b08`, img`
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
        `, [myTiles.transparency16,sprites.dungeon.darkGroundCenter,sprites.dungeon.greenOuterNorthWest,sprites.dungeon.greenOuterNorth0,sprites.dungeon.greenOuterNorth1,sprites.dungeon.greenOuterNorthEast,sprites.dungeon.greenOuterEast0,sprites.dungeon.greenOuterEast1,sprites.dungeon.greenOuterSouthWest,sprites.dungeon.greenOuterSouthEast,sprites.dungeon.greenOuterSouth1,sprites.dungeon.greenOuterSouth0,sprites.dungeon.greenOuterWest1,sprites.dungeon.greenOuterWest0,sprites.dungeon.greenOuterNorth2,sprites.dungeon.greenOuterEast2,sprites.dungeon.greenOuterSouth2,sprites.dungeon.greenOuterWest2,sprites.dungeon.greenInnerSouthEast,sprites.dungeon.greenInnerSouthWest,sprites.dungeon.darkGroundEast,sprites.dungeon.floorDark0,sprites.dungeon.floorDark1,sprites.dungeon.floorDark4,sprites.dungeon.floorDark3,sprites.dungeon.hazardLava0,sprites.dungeon.hazardLava1,sprites.dungeon.darkGroundNorthWest1,sprites.dungeon.darkGroundSouth,sprites.dungeon.darkGroundNorthEast1,sprites.dungeon.darkGroundWest,sprites.dungeon.darkGroundNorth,sprites.dungeon.darkGroundSouthEast1,sprites.dungeon.darkGroundSouthWest1], TileScale.Sixteen))
    scene.setBackgroundColor(13)
}
function bloon_image_from_health (health: number) {
    // https://bloons.fandom.com/wiki/Bloon#BTD_series_
    bloon_images = [
    img`
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
        `,
    img`
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
        `,
    img`
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
        `,
    img`
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
        `,
    img`
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
        `,
    img`
        . . . . . . f f f f . . . . . . 
        . . . . . f f f f f f . . . . . 
        . . . . f f f f f f f f . . . . 
        . . . . f f f f f f f f . . . . 
        . . . . f f f f f f f f . . . . 
        . . . . f f f f f f f f . . . . 
        . . . . . f f f f f f . . . . . 
        . . . . . f f f f f f . . . . . 
        . . . . . . f f f f . . . . . . 
        . . . . . . . f f . . . . . . . 
        . . . . . . . f . . . . . . . . 
        . . . . . . . f . . . . . . . . 
        . . . . . . . . f . . . . . . . 
        . . . . . . . . f . . . . . . . 
        . . . . . . . f . . . . . . . . 
        . . . . . . . f . . . . . . . . 
        `,
    img`
        . . . . . . 1 1 1 1 . . . . . . 
        . . . . . 1 1 1 1 1 1 . . . . . 
        . . . . 1 1 1 1 1 1 1 1 . . . . 
        . . . . 1 1 1 1 1 1 1 1 . . . . 
        . . . . 1 1 1 1 1 1 1 1 . . . . 
        . . . . 1 1 1 1 1 1 1 1 . . . . 
        . . . . . 1 1 1 1 1 1 . . . . . 
        . . . . . 1 1 1 1 1 1 . . . . . 
        . . . . . . 1 1 1 1 . . . . . . 
        . . . . . . . 1 1 . . . . . . . 
        . . . . . . . f . . . . . . . . 
        . . . . . . . f . . . . . . . . 
        . . . . . . . . f . . . . . . . 
        . . . . . . . . f . . . . . . . 
        . . . . . . . f . . . . . . . . 
        . . . . . . . f . . . . . . . . 
        `,
    img`
        . . . . . . a a a a . . . . . . 
        . . . . . a a a a a a . . . . . 
        . . . . a a a a a a a a . . . . 
        . . . . a a a a a a a a . . . . 
        . . . . a a a a a a a a . . . . 
        . . . . a a a a a a a a . . . . 
        . . . . . a a a a a a . . . . . 
        . . . . . a a a a a a . . . . . 
        . . . . . . a a a a . . . . . . 
        . . . . . . . a a . . . . . . . 
        . . . . . . . f . . . . . . . . 
        . . . . . . . f . . . . . . . . 
        . . . . . . . . f . . . . . . . 
        . . . . . . . . f . . . . . . . 
        . . . . . . . f . . . . . . . . 
        . . . . . . . f . . . . . . . . 
        `
    ]
    return bloon_images[Math.constrain(health - 1, 0, bloon_images.length - 1)]
}
function update_tack_shooter (sprite: Sprite) {
    timer.throttle(convertToText(sprites.readDataNumber(sprite, "tower_id")), sprites.readDataNumber(sprite, "fire_dart_delay"), function () {
        if (can_find_farthest_among_path_sprite_of_kind(sprite, SpriteKind.Enemy, sprites.readDataNumber(sprite, "tower_distance"))) {
            for (let index = 0; index <= sprites.readDataNumber(sprite, "dart_count") - 1; index++) {
                projectile = summon_dart(sprites.readDataNumber(sprite, "dart_image_index"), sprite)
                sprites.setDataNumber(projectile, "angle", index * (360 / sprites.readDataNumber(sprite, "dart_count")))
                transformSprites.rotateSprite(projectile, sprites.readDataNumber(projectile, "angle"))
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
        }
    })
}
function set_ui_icons () {
    info.setScore(100)
    info.setLife(100)
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
    sprites.setDataNumber(sprite_tower, "fire_dart_delay", 1000)
    sprites.setDataNumber(sprite_tower, "fire_dart_delay_min", 100)
    sprites.setDataNumber(sprite_tower, "tower_id", tower_counter)
    sprites.setDataNumber(sprite_tower, "tower_distance", 40)
    sprites.setDataString(sprite_tower, "name", "tack_shooter")
    sprites.setDataNumber(sprite_tower, "sell_price", 35)
    sprites.setDataNumber(sprite_tower, "dart_speed", 150)
    sprites.setDataNumber(sprite_tower, "dart_life", 100)
    sprites.setDataNumber(sprite_tower, "dart_count", 8)
    sprites.setDataNumber(sprite_tower, "dart_count_max", 16)
    sprites.setDataNumber(sprite_tower, "dart_health", 1)
    sprites.setDataNumber(sprite_tower, "dart_health_max", 3)
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
    if (sprites.readDataNumber(overlapping_sprite, "dart_health") < sprites.readDataNumber(overlapping_sprite, "dart_health_max")) {
        tower_options.push("Increase dart durability ($40) to " + (sprites.readDataNumber(overlapping_sprite, "dart_health") + 1) + " Bloons")
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
        overlapping_sprite.startEffect(effects.halo, 1000)
        change_score(-50)
    } else if (blockMenu.selectedMenuOption().includes("Increase visibility") && info.score() >= 30) {
        sprites.changeDataNumberBy(overlapping_sprite, "tower_distance", 16)
        sprites.changeDataNumberBy(overlapping_sprite, "sell_price", 20)
        overlapping_sprite.startEffect(effects.halo, 1000)
        change_score(-30)
    } else if (blockMenu.selectedMenuOption().includes("Increase dart durability") && info.score() >= 40) {
        sprites.changeDataNumberBy(overlapping_sprite, "dart_health", 1)
        sprites.changeDataNumberBy(overlapping_sprite, "sell_price", 30)
        overlapping_sprite.startEffect(effects.halo, 1000)
        change_score(-40)
    } else {
        sprite_cursor_pointer.say("Not enough money!", 1000)
    }
}
function set_map_eerie_swamp () {
    bloon_paths = []
    start_x = 2
    start_y = 0
    land_tiles = [myTiles.tile14, myTiles.tile15, sprites.builtin.forestTiles0]
    water_tiles = [myTiles.tile20]
    for (let tilemap2 of [tiles.createMap(tiles.createTilemap(hex`10000c00030405070704070403010401030103010703020704010403020202040202020601070207030704030204020202040101040302020704010202070103010107040101030201040302040304010307030107040702040701020202020203030407010702020701040304020302010303070704020407020202020204020303070101030207010201040103040202020207030702040202020201040201030402010701020202010402020202020202020703070301070303070107030701030701`, img`
        2 2 . 2 2 2 2 2 2 2 2 2 2 2 2 2 
        2 2 . 2 2 2 2 2 . . . 2 . . . . 
        2 2 . 2 2 2 2 2 . 2 . . . 2 2 2 
        2 2 . . 2 2 2 . . 2 2 2 2 2 2 2 
        2 2 2 . 2 2 2 . 2 2 2 2 2 2 2 2 
        2 2 2 . 2 2 2 . . . . . 2 2 2 2 
        2 2 . . 2 2 2 2 2 2 2 . 2 2 2 2 
        2 2 . 2 2 2 2 2 2 2 2 . 2 2 2 2 
        2 2 . 2 2 2 2 2 2 2 2 . . . . 2 
        2 2 . 2 . . . . 2 2 2 2 2 2 . 2 
        2 2 . . . 2 2 . . . . . . . . 2 
        2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
        `, [myTiles.transparency16,sprites.builtin.forestTiles0,myTiles.tile13,myTiles.tile14,myTiles.tile15,myTiles.tile11,myTiles.tile12,myTiles.tile20], TileScale.Sixteen)), tiles.createMap(tiles.createTilemap(hex`10000c00030405070704070403010401030103010703020704010403020202040202020601070207030704030204020202040101040302020704010202070103010107040101030201040302040304010307030107040702040701020202020203030407010702020701040304020302010303070704020407020202020204020303070101030207010201040103040202020207030702040202020201040701030402010701020202010402020202020202020703070301070303070107030701030701`, img`
        2 2 . 2 2 2 2 2 2 2 2 2 2 2 2 2 
        2 2 . 2 2 2 2 2 . . . 2 . . . . 
        2 2 . 2 2 2 2 2 . 2 . . . 2 2 2 
        2 2 . . 2 2 2 . . 2 2 2 2 2 2 2 
        2 2 2 . 2 2 2 . 2 2 2 2 2 2 2 2 
        2 2 2 . 2 2 2 . . . 2 2 2 2 2 2 
        2 2 . . 2 2 2 2 2 . 2 2 2 2 2 2 
        2 2 . 2 2 . . . . . 2 2 2 2 2 2 
        2 2 . 2 2 . 2 2 2 2 2 2 2 2 2 2 
        2 2 . 2 . . 2 2 2 2 2 2 2 2 2 2 
        2 2 . . . 2 2 2 2 2 2 2 2 2 2 2 
        2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
        `, [myTiles.transparency16,sprites.builtin.forestTiles0,myTiles.tile13,myTiles.tile14,myTiles.tile15,myTiles.tile11,myTiles.tile12,myTiles.tile20], TileScale.Sixteen))]) {
        tiles.loadMap(tilemap2)
        bloon_paths.push(scene.aStar(tiles.getTilesByType(myTiles.tile11)[0], tiles.getTilesByType(myTiles.tile12)[0]))
    }
    tiles.setTilemap(tiles.createTilemap(hex`10000c00020305070703070302040304020402040702010703040302010101030101010604070107020703020103010101030404030201010703040101070402040407030404020104030201030203040207020407030701030704010101010102020307040701010704030203010201040202070703010307010101010103010202070404020107040104030402030101010107020701030101010104030704020301040704010101040301010101010101010702070204070202070407020704020704`, img`
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
        `, [myTiles.transparency16,myTiles.tile13,myTiles.tile14,myTiles.tile15,sprites.builtin.forestTiles0,myTiles.tile11,myTiles.tile12,myTiles.tile20], TileScale.Sixteen))
    scene.setBackgroundColor(6)
}
function can_find_farthest_among_path_sprite_of_kind (sprite: Sprite, kind: number, max_distance: number) {
    for (let sprite2 of sprites.allOfKind(kind)) {
        if (spriteutils.distanceBetween(sprite, sprite2) <= max_distance || max_distance == 0) {
            return true
        }
    }
    return false
}
function change_score (diff: number) {
    if (!(debug)) {
        info.changeScoreBy(diff)
    }
}
function summon_bloon (col: number, row: number, health: number, speed: number, path: number) {
    sprite_bloon = sprites.create(bloon_image_from_health(health), SpriteKind.Enemy)
    tiles.placeOnTile(sprite_bloon, tiles.getTileLocation(col, row))
    sprites.setDataNumber(sprite_bloon, "health", health)
    sprites.setDataNumber(sprite_bloon, "original_health", health)
    scene.followPath(sprite_bloon, bloon_paths[path], speed)
}
blockMenu.onMenuOptionSelected(function (option, index) {
    menu_option_selected = true
})
function set_map_city_park () {
    bloon_paths = []
    start_x = 1
    start_y = 0
    land_tiles = [myTiles.tile1, sprites.castle.tileGrass1, sprites.castle.tileGrass3, sprites.castle.tileGrass2]
    water_tiles = [
    myTiles.tile2,
    myTiles.tile3,
    myTiles.tile4,
    myTiles.tile6,
    myTiles.tile7,
    myTiles.tile8,
    myTiles.tile9,
    myTiles.tile10
    ]
    for (let tilemap2 of [tiles.createMap(tiles.createTilemap(hex`10000c000b1712010e0101010b010c0d010f12010c0f13151515151515151515151312010110141414131314141414141413120d01010b01010f120c010101010b0f12010d01010c0d0f120104050506010f120c011115151513120103020207010f12010e0f13141413120103020207010f1201010f12010b0f12010a0909080d0f120e010f120d010f120e01010c01010f12010b0f12010c0f13151515151515131201010f120e0110141414141414141416010d181201010d0101010e01010c010101`, img`
        2 . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
        2 . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
        2 . . . . . . . . . . . . . 2 2 
        2 2 2 2 2 2 2 2 2 2 2 2 2 . 2 2 
        2 2 2 2 2 2 2 2 2 2 2 2 2 . 2 2 
        2 . . . . . . 2 2 2 2 2 2 . 2 2 
        2 . 2 2 2 2 . 2 2 2 2 2 2 . 2 2 
        2 . 2 2 2 2 . 2 2 2 2 2 2 . 2 2 
        2 . 2 2 2 2 . 2 2 2 2 2 2 . 2 2 
        2 . 2 2 2 2 . . . . . . . . 2 2 
        2 . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
        2 . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
        `, [myTiles.transparency16,myTiles.tile1,myTiles.tile2,myTiles.tile3,myTiles.tile4,myTiles.tile5,myTiles.tile6,myTiles.tile7,myTiles.tile8,myTiles.tile9,myTiles.tile10,sprites.castle.tileGrass2,sprites.builtin.forestTiles0,sprites.castle.tileGrass1,sprites.castle.tileGrass3,sprites.castle.tilePath4,sprites.castle.tilePath7,sprites.castle.tilePath1,sprites.castle.tilePath6,sprites.castle.tilePath5,sprites.castle.tilePath8,sprites.castle.tilePath2,sprites.castle.tilePath9,myTiles.tile11,myTiles.tile12], TileScale.Sixteen)), tiles.createMap(tiles.createTilemap(hex`10000c000b0f17010e0101010b010c0d010f18010c0f13151515151515151515151312010110141414131314141414141413120d01010b01010f120c010101010b0f12010d01010c0d0f120104050506010f120c011115151513120103020207010f12010e0f13141413120103020207010f1201010f12010b0f12010a0909080d0f120e010f120d010f120e01010c01010f12010b0f12010c0f13151515151515131201010f120e0110141414141414141416010d0f1201010d0101010e01010c010101`, img`
        2 2 . 2 2 2 2 2 2 2 2 2 2 2 . 2 
        2 2 . . . . 2 2 2 2 2 2 2 2 . 2 
        2 2 2 2 2 . 2 2 2 2 2 2 2 2 . 2 
        2 2 2 2 2 . 2 2 2 2 2 2 2 2 . 2 
        2 2 2 2 2 . 2 2 2 2 2 2 2 2 . 2 
        2 2 2 2 2 . 2 2 2 2 2 2 2 2 . 2 
        2 2 2 2 2 . 2 2 2 2 2 2 2 2 . 2 
        2 2 2 2 2 . 2 2 2 2 2 2 2 2 . 2 
        2 2 2 2 2 . 2 2 2 2 2 2 2 2 . 2 
        2 2 2 2 2 . 2 2 2 2 2 2 2 2 . 2 
        2 2 2 2 2 . . . . . . . . . . 2 
        2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
        `, [myTiles.transparency16,myTiles.tile1,myTiles.tile2,myTiles.tile3,myTiles.tile4,myTiles.tile5,myTiles.tile6,myTiles.tile7,myTiles.tile8,myTiles.tile9,myTiles.tile10,sprites.castle.tileGrass2,sprites.builtin.forestTiles0,sprites.castle.tileGrass1,sprites.castle.tileGrass3,sprites.castle.tilePath4,sprites.castle.tilePath7,sprites.castle.tilePath1,sprites.castle.tilePath6,sprites.castle.tilePath5,sprites.castle.tilePath8,sprites.castle.tilePath2,sprites.castle.tilePath9,myTiles.tile11,myTiles.tile12], TileScale.Sixteen))]) {
        tiles.loadMap(tilemap2)
        bloon_paths.push(scene.aStar(tiles.getTilesByType(myTiles.tile11)[0], tiles.getTilesByType(myTiles.tile12)[0]))
    }
    tiles.setTilemap(tiles.createTilemap(hex`10000c001501020914090909150916130901020916010405050505050505050505040209090306060604040606060606060402130909150909010216090909091501020913090916130102090c0d0d0e0901021609080505050402090b0a0a0f0901020914010406060402090b0a0a0f090102090901020915010209121111101301021409010213090102140909160909010209150102091601040505050505050402090901021409030606060606060606070913010209091309090914090916090909`, img`
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
        `, [myTiles.transparency16,sprites.castle.tilePath4,sprites.castle.tilePath6,sprites.castle.tilePath7,sprites.castle.tilePath5,sprites.castle.tilePath2,sprites.castle.tilePath8,sprites.castle.tilePath9,sprites.castle.tilePath1,myTiles.tile1,myTiles.tile2,myTiles.tile3,myTiles.tile4,myTiles.tile5,myTiles.tile6,myTiles.tile7,myTiles.tile8,myTiles.tile9,myTiles.tile10,sprites.castle.tileGrass1,sprites.castle.tileGrass3,sprites.castle.tileGrass2,sprites.builtin.forestTiles0], TileScale.Sixteen))
    scene.setBackgroundColor(7)
}
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Enemy, function (sprite, otherSprite) {
    sprites.changeDataNumberBy(otherSprite, "health", -1)
    sprites.changeDataNumberBy(sprite, "dart_health", -1)
    if (sprites.readDataNumber(otherSprite, "health") <= 0) {
        info.changeScoreBy(sprites.readDataNumber(otherSprite, "original_health"))
        otherSprite.destroy(effects.trail, 100)
    } else {
        otherSprite.setImage(bloon_image_from_health(sprites.readDataNumber(otherSprite, "health")))
    }
    if (sprites.readDataNumber(sprite, "dart_health") <= 0) {
        sprite.destroy()
    }
})
let sprite_bloon: Sprite = null
let progress = 0
let dart_images: Image[] = []
let sprite_farthest_among_path: Sprite = null
let strength = 0
let sprite_cursor: Sprite = null
let start_y = 0
let start_x = 0
let bloon_images: Image[] = []
let bloon_paths: tiles.Location[][] = []
let bloon_path = 0
let water_tiles: Image[] = []
let sprite_tower: Sprite = null
let sprite_cursor_pointer: Sprite = null
let overlapping_sprite: Sprite = null
let tower_options: string[] = []
let land_tiles: Image[] = []
let projectile: Sprite = null
let farthest_sprite: Sprite = null
let tower_counter = 0
let menu_open = false
let starting_wave = false
let wave_begin = false
let display_wave = false
let wave = 0
let menu_option_selected = false
let debug = false
debug = true
color.setPalette(
color.Black
)
menu_option_selected = false
set_map_city_park()
blockMenu.setControlsEnabled(false)
blockMenu.setColors(1, 15)
blockMenu.showMenu([
"City Park",
"Field of Flowers",
"Eerie Swamp",
"Sand Castle",
"The Dark Dungeon",
"Figure Eights (And Zeros)"
], MenuStyle.Grid, MenuLocation.BottomHalf)
fade_out(2000, true)
blockMenu.setControlsEnabled(true)
while (!(menu_option_selected)) {
    if (blockMenu.selectedMenuIndex() == 0) {
        set_map_city_park()
    } else if (blockMenu.selectedMenuIndex() == 1) {
        set_map_field_of_flowers()
    } else if (blockMenu.selectedMenuIndex() == 2) {
        set_map_eerie_swamp()
    } else if (blockMenu.selectedMenuIndex() == 3) {
        set_map_sand_castle()
    } else if (blockMenu.selectedMenuIndex() == 4) {
        set_map_dark_dungeon()
    } else if (blockMenu.selectedMenuIndex() == 5) {
        set_map_figure_eights()
    }
    pause(100)
}
blockMenu.closeMenu()
fade_in(2000, true)
pause(1000)
create_cursor()
set_ui_icons()
initialize_variables()
start_game()
fade_out(2000, false)
game.onUpdate(function () {
    sprite_cursor_pointer.top = sprite_cursor.top
    sprite_cursor_pointer.left = sprite_cursor.left
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
        } else if (sprites.readDataString(sprite, "name") == "sniper_monkey") {
            update_sniper_monkey(sprite)
        }
    }
})
