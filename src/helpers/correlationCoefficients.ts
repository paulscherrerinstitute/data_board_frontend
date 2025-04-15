/**
 * Calculates the Pearson correlation coefficient between two arrays.
 * Code adapted into TypeScript fro:m https://gist.github.com/matt-west/6500993?permalink_comment_id=3718526#gistcomment-3718526
 */
export function pearsonCoefficient(x: number[], y: number[]) {
    let n = x.length;
    let nn = 0;
    const average = (l: number[]): number =>
        l.length === 0 ? 0 : l.reduce((s, a) => s + a, 0) / l.length;
    const calc = (v: number[], avg: number): number =>
        Math.sqrt(v.reduce((s, a) => s + a * a, 0) - n * avg * avg);

    for (let i = 0; i < n; i++, nn++) {
        if ((!x[i] && x[i] !== 0) || (!y[i] && y[i] !== 0)) {
            nn--;
            continue;
        }
        x[nn] = x[i];
        y[nn] = y[i];
    }
    if (n !== nn) {
        x = x.splice(0, nn);
        y = y.splice(0, nn);
        n = nn;
    }
    const avg_x = average(x),
        avg_y = average(y);
    return (
        (x
            .map((e, i) => ({ x: e, y: y[i] }))
            .reduce((v, a) => v + a.x * a.y, 0) -
            n * avg_x * avg_y) /
        (calc(x, avg_x) * calc(y, avg_y))
    );
}

/**
 * Helper function to assign ranks to array values, handling ties properly.
 */
function rank(arr: number[]): number[] {
    const sorted = arr
        .map((val, idx) => ({ val, idx }))
        .sort((a, b) => a.val - b.val);

    const ranks = Array<number>(arr.length);

    for (let i = 0; i < sorted.length; ) {
        let j = i;
        while (j < sorted.length - 1 && sorted[j].val === sorted[j + 1].val) {
            j++;
        }

        const avgRank = (i + j + 2) / 2; // +1+1=+2 to convert 0-based to 1-based
        for (let k = i; k <= j; k++) {
            ranks[sorted[k].idx] = avgRank;
        }

        i = j + 1;
    }

    return ranks;
}

/**
 * Calculates the Spearman rank correlation coefficient between two arrays.
 */
export function spearmanCoefficient(x: number[], y: number[]): number {
    if (x.length !== y.length)
        throw new Error("Arrays must be the same length");
    const rankX = rank(x);
    const rankY = rank(y);
    return pearsonCoefficient(rankX, rankY);
}
