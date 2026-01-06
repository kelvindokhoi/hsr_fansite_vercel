class ImageQueue {
    constructor(concurrency = 6) {
        this.concurrency = concurrency;
        this.running = 0;
        this.queue = [];
    }

    async add(fn) {
        if (this.running >= this.concurrency) {
            await new Promise(resolve => this.queue.push(resolve));
        }

        this.running++;
        try {
            return await fn();
        } finally {
            this.running--;
            if (this.queue.length > 0) {
                const next = this.queue.shift();
                next();
            }
        }
    }
}

export const imageQueue = new ImageQueue(6); 
