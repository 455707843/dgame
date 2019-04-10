import {GridData,MapData,PlayerData} from "../Data";

export default class ReachGrid
{
    private m_arrReach: Array<GridData> = [];
    private m_arrReachedFlag: Array<Array<number>> = [];
    private DIR: Array<Array<number>> = [[0,1],[0,-1],[1,0],[-1,0]];
    public GetReachGrid(map: MapData,player: PlayerData): Array<GridData>
    {
        this.m_arrReach = [];
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
        this.m_arrReachedFlag[posX][posY] = power;
        //走过
        // for(let i: number = 0;i < this.m_arrReach.length;i++)
        // {
        //     if(map.grid[posX][posY] == this.m_arrReach[i])
        //     {
        //         return;
        //     }
        // }
        for(let i: number = 0;i < this.m_arrReach.length;i++)
        {
            for(let j: number = 0;j < 4;j++)
            {
                let tempX: number = this.m_arrReach[i].x + this.DIR[j][0];
                let tempY: number = this.m_arrReach[i].y + this.DIR[j][1];
                //超边界
                if(tempX < 0 || tempX >= map.width || tempY < 0 || tempY >= map.height)
                {
                    continue;
                }
                let cost: number = this.m_arrReachedFlag[this.m_arrReach[i].x][this.m_arrReach[i].y] - map.grid[tempX][tempY].cost;
                if(cost <= 0)
                {
                    continue;
                }
                if(this.m_arrReachedFlag[tempX][tempY] == -1)
                {
                    this.m_arrReach.push(map.grid[tempX][tempY]);
                    this.m_arrReachedFlag[tempX][tempY] = cost;
                }
                else
                {
                    this.m_arrReachedFlag[tempX][tempY] = Math.max(this.m_arrReachedFlag[tempX][tempY],cost);
                }
            }
        }
    }
}