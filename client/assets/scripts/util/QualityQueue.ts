/**
 * 只支持结构体
 */
export class QualityQueue
{
    private m_arrQueue: Array<any> = [];
    private m_iCurrSize: number = 0;
    private m_iKey: string = "";

    public Init(key: string = "value"): void
    {
        this.m_arrQueue = [];
        this.m_iCurrSize = 0;
        this.m_iKey = key;
    }

    /**
     * 插入一个数据
     *
     * @param {*} data 数据值
     * @returns {boolean} isSuccess 返回插入是否成功
     */
    public Push(data)
    {
        this.m_arrQueue[this.m_iCurrSize] = data;
        this.Up(this.m_iCurrSize);
        this.m_iCurrSize++;
        return true;
    };

    /**
     * 移除根元素，并返回根元素数据
     *
     * @returns {*} data 根元素的数据值
     */
    public Pop()
    {
        if(this.m_iCurrSize <= 0)
        {
            return null;
        }
        let maxValue = this.m_arrQueue[0];
        this.m_arrQueue[0] = this.m_arrQueue[this.m_iCurrSize - 1];
        this.m_iCurrSize--;
        this.Down(0,this.m_iCurrSize - 1);
        return maxValue;
    };

    private Down(start: number,limit: number)
    {
        //父节点
        let parentIndex: number = start;
        //左子节点
        let maxChildIndex: number = parentIndex * 2 + 1;
        let key: string = this.m_iKey;

        while(maxChildIndex <= limit)
        {
            if(maxChildIndex < limit && this.m_arrQueue[maxChildIndex][key] < this.m_arrQueue[maxChildIndex + 1][key])
            {
                //一直指向最大关键码最大的那个子节点
                maxChildIndex = maxChildIndex + 1;
            }
            if(this.m_arrQueue[parentIndex][key] >= this.m_arrQueue[maxChildIndex][key])
            {
                break;
            } else
            {
                //交换
                let temp = this.m_arrQueue[parentIndex];
                this.m_arrQueue[parentIndex] = this.m_arrQueue[maxChildIndex];
                this.m_arrQueue[maxChildIndex] = temp;
                parentIndex = maxChildIndex;
                maxChildIndex = maxChildIndex * 2 + 1
            }
        }
    }

    private Up(start: number)
    {
        let childIndex: number = start;   //当前叶节点
        let parentIndex: number = Math.floor((childIndex - 1) / 2); //父节点
        let key: string = this.m_iKey;

        while(childIndex > 0)
        {
            //如果大就不交换
            if(this.m_arrQueue[parentIndex][key] >= this.m_arrQueue[childIndex][key])
            {
                break;
            } else
            {
                let temp = this.m_arrQueue[parentIndex];
                this.m_arrQueue[parentIndex] = this.m_arrQueue[childIndex];
                this.m_arrQueue[childIndex] = temp;
                childIndex = parentIndex;
                parentIndex = Math.floor((parentIndex - 1) / 2);
            }
        }
    }
}