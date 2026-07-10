export class ProgressBar {

    constructor(total, label = "Progresso") {

        this.total = total;
        this.current = 0;
        this.label = label;
        this.startTime = Date.now();
        this.barLength = 30;

    }

    update(current, info = "") {

        this.current = current;

        const percent = Math.round((this.current / this.total) * 100);
        const filled = Math.round((this.current / this.total) * this.barLength);
        const empty = this.barLength - filled;

        const bar = "█".repeat(filled) + "░".repeat(empty);

        const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);

        const eta = this.current > 0
            ? (((Date.now() - this.startTime) / this.current) * (this.total - this.current) / 1000).toFixed(1)
            : "...";

        const line = `\r${this.label} ${bar} ${percent}% (${this.current}/${this.total}) ${elapsed}s ETA:${eta}s ${info}`;

        process.stdout.write(line.padEnd(100));

    }

    increment(info = "") {

        this.update(this.current + 1, info);

    }

    finish(message = "") {

        const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
        const finalMsg = message || `${this.label} concluído em ${elapsed}s`;

        process.stdout.write("\r" + " ".repeat(100) + "\r");
        console.log(`✅ ${finalMsg}`);

    }

}