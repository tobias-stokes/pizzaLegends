class GameObject {
    constructor(config) {
        this.id = null;
        this.isMounted = false;
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.direction = config.direction || 'down';
        this.sprite = new Sprite({
            gameObject: this,
            src: config.src || '/images/characters/people/hero.png',
        });

        this.behaviorLoop = config.behaviorLoop || new Array();
        this.behaviorLoopIndex = 0;
    }

    mount(map) {
        this.isMounted = true;
        map.addWall(this.x, this.y);

        // If we have a behavior, kick off after a short delay
        setTimeout(() => {
            this.doBehaviorEvent(map);
        }, 10);
    }

    update() {

    }

    async doBehaviorEvent(map) {
        // Don't do anything if there is more important cutscene or
        // I don't have a config to do anything
            if (map.isCutScenePlaying || this.behaviorLoop.length == 0) return;

        // Setting up our event with relative info
            let eventConfig = this.behaviorLoop[this.behaviorLoopIndex];
            eventConfig.who = this.id;

        // Create an event instance out of our next event config
            const eventHandler = new OverworldEvent({ map, event: eventConfig });
            await eventHandler.init();

        // Setting the next event to fire
            this.behaviorLoopIndex++;
            if (this.behaviorLoopIndex == this.behaviorLoop.length) {
                this.behaviorLoopIndex = 0;
            }

        this.doBehaviorEvent(map);
    }
}