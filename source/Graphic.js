const canvas = document.getElementById("canvases");
const ctx = canvas.getContext("2d");

canvas.width = 800;    // example size
canvas.height = 610;

function lerp(a, b, t) {
    return a + (b - a) * t;
}

class Plane {
    constructor(dots) {
        this.padding = 15;
        this.max = { x: 0, y: 0 }
        this.max.x = Math.max(...dots.map(sum => Math.abs(sum[0])))
        this.max.y = Math.max(...dots.map(sum => Math.abs(sum[1])))
        this.start = { x: canvas.width / 2, y: canvas.height / 2 };
        this.ratio = { x: 1, y: 1 };
        this.dots = dots;
        this.end = {
            x: [this.padding, canvas.width - this.padding],
            y: [this.padding, canvas.height - this.padding]
        }

        this.gap = {
            x: (this.end.x[1] - this.end.x[0]) / 80,
            y: (this.end.y[1] - this.end.y[0]) / 60
        }

        //if(this.max.x > (canvas.width - this.padding * 2) / 2)
            this.ratio.x = ((canvas.width - (this.padding * 2)) / 2) / (this.max.x + this.padding);

        //if(this.max.y > (canvas.heigth - this.padding * 2) / 2)
            this.ratio.y = ((canvas.height - (this.padding * 2)) / 2) / (this.max.y + this.padding);

        this.render();
    }

    render(start, end, input) {

        // Drawing Center Lines
        ctx.beginPath();
        ctx.strokeStyle = "rgba(0, 0, 0, 1)";
        ctx.moveTo(this.start.x, this.end.y[0]);
        ctx.lineTo(this.start.x, this.end.y[1]);
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = "rgba(0, 0, 0, 1)";
        ctx.moveTo(this.end.x[0], this.start.y);
        ctx.lineTo(this.end.x[1], this.start.y);
        ctx.stroke();

        // Tramslating & Drawing Points.
        for(let i = 0; i < this.dots.length; i++) { 
            let translated = {
                x: (this.dots[i][0] * this.ratio.x) + this.start.x, 
                y: (this.dots[i][1] * -1 * this.ratio.y) + this.start.y
            };
            ctx.beginPath();
            ctx.strokeStyle = "black";
            ctx.arc(translated.x, translated.y, 3, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        // Drawing Grid.
        for(let x = this.padding; x < this.end.x[1]; x += this.gap.x) {
            if(x == this.padding) continue;

            ctx.beginPath();
            ctx.strokeStyle = "rgba(0, 0, 0, 0.06)";
            ctx.moveTo(Math.round(x), this.end.y[0]);
            ctx.lineTo(Math.round(x), this.end.y[1]);
            ctx.fill();
        }

        for(let y = this.padding; y < this.end.y[1]; y += this.gap.y) {
            if(y == this.padding) continue;

            ctx.beginPath();
            ctx.strokeStyle = "rgba(0, 0, 0, 0.06)";
            ctx.moveTo(this.end.x[0], Math.round(y));
            ctx.lineTo(this.end.x[1], Math.round(y));
            ctx.stroke();
        }

        if(start != null) {

            // Drawing Possible Best Fit.
            ctx.beginPath();
            ctx.lineWidth = 3;
            ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";

            this.pbf_s_x = (start[0] * this.ratio.x) + this.start.x
            this.pbf_s_y = (start[1] * -1 * this.ratio.y) + this.start.y

            this.pbf_e_x = (end[0] * this.ratio.x) + this.start.x;
            this.pbf_e_y = (end[1] * -1 * this.ratio.y) + this.start.y;

            this.lpbf_s_y = lerp(this.pbf_e_y, this.pbf_s_y, 2);
            this.lpbf_s_x = lerp(this.pbf_e_x, this.pbf_s_x, 2);

            this.lpbf_e_y = lerp(this.pbf_s_y, this.pbf_e_y, 2);
            this.lpbf_e_x = lerp(this.pbf_s_x, this.pbf_e_x, 2);

            ctx.moveTo(this.lpbf_s_x, this.lpbf_s_y);
            ctx.lineTo(this.lpbf_e_x, this.lpbf_e_y);
            ctx.stroke();
            ctx.lineWidth = 1;

            // Drawing Slope.
            let slope = (end[1] - start[1]) / (end[0] - start[0]);
            let intercept = start[1] - slope * start[0];

            this.s_y = (((-1 * this.max.x * input[0]) + input[1]) * -1 * this.ratio.y) + this.start.y;
            this.s_x = (-1 * this.max.x * this.ratio.x) + this.start.x;

            this.e_y = (((this.max.x * input[0]) + input[1]) * -1 * this.ratio.y) + this.start.y;
            this.e_x = (this.max.x * this.ratio.x) + this.start.x;

            this.s_y = lerp(this.e_y, this.s_y, 1);
            this.s_x = lerp(this.e_x, this.s_x, 1);

            this.e_y = lerp(this.s_y, this.e_y, 1);
            this.e_x = lerp(this.s_x, this.e_x, 1);
            //console.log([this.s_x, this.s_y], [this.e_x, this.e_y], slope)

            ctx.beginPath();
            ctx.lineWidth = 3;
            ctx.strokeStyle= "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0");
            ctx.moveTo(this.s_x, this.s_y);
            ctx.lineTo(this.e_x, this.e_y);
            ctx.stroke();

            ctx.lineWidth = 1;
        }
    }
}