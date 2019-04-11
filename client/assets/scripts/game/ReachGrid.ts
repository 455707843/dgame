import {GridData,MapData,PlayerData} from "../Data";
import {QualityQueue} from "../util/QualityQueue";

export default class ReachGrid
{
    private m_arrReach: Array<GridData> = [];
    private m_arrReachedFlag: Array<Array<number>> = [];
    private m_stQualityQueue: QualityQueue = new QualityQueue;
    private DIR: Array<Array<number>> = [[0,1],[0,-1],[1,0],[-1,0]];
    public GetReachGrid(map: MapData,player: PlayerData): Array<GridData>
    {
        this.m_arrReach = [];
        this.m_stQualityQueue.Init("temp");
        for(let i: number = 0;i < map.width;i++)
        {
            this.m_arrReachedFlag[i] = [];
            for(let j: number = 0;j < map.width;j++)
            {
                this.m_arrReachedFlag[i].push(-1);
            }
        }
        this.Search(player.x,player.y,player.power,map);
        return this.m_arrReach;
    }

    //搜索可到点
    private Search(posX: number,posY: number,power: number,map: MapData): void
    {
        //行动力不足
        if(power <= 0)
        {
            return;
        }
        //超边界
        if(posX < 0 || posX >= map.width || posY < 0 || posY >= map.height)
        {
            return;
        }
        this.m_arrReach.push(map.grid[posX][posY]);
        this.m_stQualityQueue.Push(map.grid[posX][posY]);
        this.m_arrReachedFlag[posX][posY] = power
        map.grid[posX][posY].temp = power;
        while(this.m_stQualityQueue.Size())
        {
            let curNode: GridData = this.m_stQualityQueue.Pop();
            for(let j: number = 0;j < 4;j++)
            {
                let tempX: number = curNode.x + this.DIR[j][0];
                let tempY: number = curNode.y + this.DIR[j][1];
                //超边界
                if(tempX < 0 || tempX >= map.width || tempY < 0 || tempY >= map.height)
                {
                    continue;
                }
                let cost: number = curNode.temp - map.grid[tempX][tempY].cost;
                if(cost < 0)
                {
                    continue;
                }
                if(this.m_arrReachedFlag[tempX][tempY] == -1)
                {
                    this.m_arrReach.push(map.grid[tempX][tempY]);
                    this.m_arrReachedFlag[tempX][tempY] = cost;
                    this.m_stQualityQueue.Push(map.grid[tempX][tempY]);
                    map.grid[tempX][tempY].temp = cost;
                }
            }
        }
    }
}