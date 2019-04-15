export class Opt
{
    private m_arrOpt: Array<OptData>;
    private m_stNode: cc.Node;
    public Init(node: cc.Node): void
    {
        this.m_arrOpt = [];
    }

    public SetOpt(data: Array<OptData>): void
    {
        this.m_arrOpt = data;
    }
}

export class OptData
{
    type: OptType;
    callback: Function;
}

//操作类型
export enum OptType
{
    move = 0,
}