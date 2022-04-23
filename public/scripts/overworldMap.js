class OverworldMap {
    constructor(config) {
        this.overworld = null;
        this.gameObjects = config.gameObjects;
        this.cutSceneSpaces = config.cutSceneSpaces || new Object();
        this.walls = config.walls || new Object();

        this.lowerImage = new Image();
        this.lowerImage.src = config.lowerSrc;

        this.upperImage = new Image();
        this.upperImage.src = config.upperSrc;

        this.isCutScenePlaying = false;
    }

    drawLowerImage(ctx, cameraPerson) {
        ctx.drawImage(
            this.lowerImage,
            utils.withGrid(10.5) - cameraPerson.x,
            utils.withGrid(6) - cameraPerson.y,
        );
    }

    drawUpperImage(ctx, cameraPerson) {
        ctx.drawImage(
            this.upperImage,
            utils.withGrid(10.5) - cameraPerson.x,
            utils.withGrid(6) - cameraPerson.y,
        );
    }

    isSpaceTaken(currentX, currentY, direction) {
        const { x, y } = utils.nextPosition(currentX, currentY, direction);
        return this.walls[`${x},${y}`] || false;
    }

    mountObjects() {
        Object.keys(this.gameObjects).forEach(key => {
            let object = this.gameObjects[key];
            object.id = key;

            // TODO: determine if this object should actually mount

            object.mount(this);
        });
    }

    async startCutScene(events) {
        this.isCutScenePlaying = true;

        for (let i = 0; i < events.length; i++) {
            const eventHandler = new OverworldEvent({
                event: events[i],
                map: this
            });
            await eventHandler.init();
        }

        this.isCutScenePlaying = false;

        // Reset NPCs to do their idle behavior
            Object.values(this.gameObjects).forEach(object => object.doBehaviorEvent(this));
    }

    checkForActionCutScene() {
        const hero = this.gameObjects['hero'];
        const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction);
        const match = Object.values(this.gameObjects).find(object => {
            return `${object.x},${object.y}` == `${nextCoords.x},${nextCoords.y}`;
        });
        if (!this.isCutScenePlaying && match && match.talking.length) {
            this.startCutScene(match.talking[0].events);
        }
    }

    checkForFootstepCutScene() {
        const hero = this.gameObjects['hero'];
        const match = this.cutSceneSpaces[ `${hero.x},${hero.y}` ];
        if (!this.isCutScenePlaying && match) {
            this.startCutScene( match[0].events );
        }
    }

    addWall(x, y) {
        this.walls[`${x},${y}`] = true;
    }

    removeWall(x, y) {
        delete this.walls[`${x},${y}`];
    }

    moveWall(wasX, wasY, direction) {
        this.removeWall(wasX, wasY);
        const { x, y } = utils.nextPosition(wasX, wasY, direction);
        this.addWall(x, y);
    }
}

window.OverworldMaps = {
    DemoRoom: {
        lowerSrc: '/images/maps/DemoLower.png',
        upperSrc: '/images/maps/DemoUpper.png',
        gameObjects: {
            hero: new Person({
                isPlayerControlled: true,
                x: utils.withGrid(5),
                y: utils.withGrid(6)
            }),
            npcA: new Person({
                x: utils.withGrid(7),
                y: utils.withGrid(8),
                src: '/images/characters/people/npc1.png',
                behaviorLoop: [
                    { type: 'stand', direction: 'left', time: 800 },
                    { type: 'stand', direction: 'up', time: 800 },
                    { type: 'stand', direction: 'right', time: 1200 },
                    { type: 'stand', direction: 'up', time: 300 },
                ],
                talking: [{
                    events: [
                        { type: 'textMessage', text: 'Why hello there...', faceHero: 'npcA' },
                        { type: 'textMessage', text: 'FUCK OFFF WE\'RE FULL!!!' },
                        { who: 'hero', type: 'walk', direction: 'up' }
                    ]
                }]
            }),
            npcB: new Person({
                x: utils.withGrid(9),
                y: utils.withGrid(4),
                src: '/images/characters/people/npc2.png',
                
            })
        },
        walls: {
            [ utils.asGridCoords(7, 6) ] : true,
            [ utils.asGridCoords(8, 6) ] : true,
            [ utils.asGridCoords(7, 7) ] : true,
            [ utils.asGridCoords(8, 7) ] : true
        },
        cutSceneSpaces: {
            [ utils.asGridCoords(7, 4) ]: [{
                events: [
                    { type: 'textMessage', text: 'HEY!!!' },
                    { who: 'hero', type: 'walk', direction: 'down' },
                    { who: 'hero', type: 'stand', direction: 'right', time: 500 },
                    { who: 'npcB', type: 'walk', direction: 'down' },
                    { who: 'npcB', type: 'walk', direction: 'left' },
                    { type: 'textMessage', text: 'You cannot be in there' },
                    { who: 'hero', type: 'walk', direction: 'left' }
                ]
            }],
            [ utils.asGridCoords(5, 10) ]: [{
                events: [
                    { type: 'changeMap', map: 'Kitchen' }
                ]
            }]
        }
    },
    Kitchen: {
        lowerSrc: '/images/maps/KitchenLower.png',
        upperSrc: '/images/maps/KitchenUpper.png',
        gameObjects: {
            hero: new Person({
                isPlayerControlled: true,
                x: utils.withGrid(5),
                y: utils.withGrid(5)
            }),
            npcA: new Person({
                x: utils.withGrid(9),
                y: utils.withGrid(6),
                src: '/images/characters/people/npc2.png'
            }),
            npcB: new Person({
                x: utils.withGrid(10),
                y: utils.withGrid(8),
                src: '/images/characters/people/npc3.png',
                talking: [{
                    events: [
                        { type: 'textMessage', text: 'You made it!', faceHero: 'npcB' }
                    ]
                }]
            })
        }
    }
};