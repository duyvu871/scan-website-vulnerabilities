export function useScore<T extends string>(labels: Record<T, [number, number]>) {
    const getScore = (data: number[]): {label: T, score: number} => {
        let score: number;
        let label = '' as T;
        const averageScore = data.reduce((acc, value) => acc + value, 0)/data.length;
        score = averageScore;
        for (const [key, value] of Object.entries<[number, number]>(labels)) {
            if (averageScore >= value[0] && averageScore <= value[1]) {
                label = key as T;
                break;
            }
        }
        return {label, score};
    }

    return {getScore};
}