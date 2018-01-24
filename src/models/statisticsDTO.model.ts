export class StatisticsDTO {
    constructor(
        public totalGames: number,
        public mostFrequentGoal: Map<string,Object>,
        public leastFrequentGoal: Map<string,Object>,
        public highestScoredGoal: Map<string,Object>,
        public lowestScoredGoal: Map<string,Object>
    ){

    }
}