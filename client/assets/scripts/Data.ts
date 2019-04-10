//如果有自定义的类型 必须添加在Data.ts中 禁止在其他地方定义数据类型 数据命名可以不加类型标识
export class MapData
{
    //地图id
    id: number;
    //地图所在层
    floor: number;
    //格子大小 正方形,长宽相同
    gridSize: number;
    //格子数组
    grid: Array<Array<eGridType>>;
}

export class GridData
{
    //格子消耗
    cost: number;
    //格子地图坐标x
    x: number;
    //格子地图坐标y
    y: number;
}

//格子类型 地形
export enum eGridType
{

}

//人物信息(包括人物基本信息)
export class PlayerData
{
    //人物位置信息
    //横坐标
    x: number;
    //纵坐标
    y: number;
    //层信息 0层默认home 1-99特殊场景层 100-199战斗场景层 200-299战斗场景层......
    cell: number;

}












//人物战斗信息
export class PlayerBattleData
{
    //士气 非常重要的属性 决定旗子先后顺序 决定玩家是否存亡 士气亡, 则人亡
    morale:number;
    //携带的兵种

}









































//侍者信息
export class ServantData
{
}






























