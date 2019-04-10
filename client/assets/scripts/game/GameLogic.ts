import {MapData,PlayerData,GridData} from "../Data";
import ReachGrid from "./ReachGrid";

export class GameLogic
{
    private m_stMap: MapData;
    private m_stPlayer: Map<number,PlayerData>;
    private m_stReachGrid: ReachGrid;
    public Init()
    {
        this.m_stMap = new MapData();
        this.m_stPlayer = new Map<number,PlayerData>();
        this.m_stReachGrid = new ReachGrid();

        this.m_stMap.width = 20;
        this.m_stMap.height = 20;
        this.m_stMap.grid = [];
        for(let i: number = 0;i < this.m_stMap.width;i++)
        {
            let temp: Array<GridData> = [];
            for(let j: number = 0;j < this.m_stMap.height;j++)
            {
                let grid: GridData = new GridData();
                grid.cost = 1;
                grid.x = i;
                grid.y = j;
                temp.push(grid);
            }
            this.m_stMap.grid.push(temp);
        }
        cc.log(this.m_stMap.grid);

        let test: PlayerData = new PlayerData();
        test.power = 7;
        test.x = 0;
        test.y = 0;
        cc.log(this.m_stReachGrid.GetReachGrid(this.m_stMap,test));
    }
}