import {ResStruct} from "./ResMgr";

/**
 * 通用对象池，用来生成简单数据、类
**/

export default class ObjectPool 
{
    private static m_arrPool: Array<Array<any>>;
    private static m_arrObject: Array<Array<any>>;
    private static m_mapNameLog: Map<number,string>;
    private static m_mapMaxSize: Map<number,number>;
    private static TotalKey: number = 0;
    constructor()
    {
    }

    public static Init(): void
    {
        ObjectPool.m_arrPool = new Array<Array<any>>();
        ObjectPool.m_arrObject = new Array<Array<any>>();
        ObjectPool.m_mapNameLog = new Map<number,string>();
        ObjectPool.m_mapMaxSize = new Map<number,number>();
        let cnt = 500;
        while(cnt--)
        {
            this.CheckIn(new ResStruct());
        }
    }

    /**
     * 
     * @param debugName debug用的名称
     * @param size 最大数量
     * @param classFactory 类
     */
    public static SetMaxSize(size: number,classFactory: any): void
    {
        let iPoolKey: number = ObjectPool.CheckObject(classFactory);
        ObjectPool.m_mapMaxSize.set(iPoolKey,size);
    }

    /**
     * 
     * @param classFactory 传入的类
     */
    public static CheckOut(classFactory: any): any
    {
        let iPoolKey: number = ObjectPool.CheckObject(classFactory);
        let result;
        let arrPool: Array<any> = ObjectPool.m_arrPool[iPoolKey];
        let arrObject: Array<any> = ObjectPool.m_arrObject[iPoolKey];
        if(arrPool.length)
        {
            result = arrPool.shift();
        }
        else
        {
            result = new classFactory();
        }
        result.pool_key = iPoolKey;
        arrObject.push(result);
        return result;
    }

    public static CheckIn(obj: any): void
    {
        let classFactory = obj.constructor;
        let iPoolKey: number = ObjectPool.CheckObject(classFactory);
        let arrObj: Array<any> = ObjectPool.m_arrObject[iPoolKey];
        if(!arrObj)
        {
            arrObj = [];
        }
        let index = ObjectPool.m_arrPool[iPoolKey].indexOf(obj);
        if(index != -1)
        {
            return;
        }
        ObjectPool.m_arrPool[iPoolKey].push(obj);
        index = arrObj.indexOf(obj);
        if(index != -1)
        {
            let len = arrObj.length - 1;
            arrObj[index] = arrObj[len];
            arrObj.length = len;
        }
    }

    private static CheckObject(classFactory: any): number
    {
        let has = (classFactory as Object).hasOwnProperty("pool_key");//检查是否有pool_key的属性，没有就在原型链中加入
        let iPoolKey: number;
        if(has)
        {
            iPoolKey = classFactory["pool_key"];
        }
        else
        {
            iPoolKey = ObjectPool.TotalKey;
            classFactory["pool_key"] = iPoolKey
            ObjectPool.TotalKey++;
            ObjectPool.m_mapNameLog[iPoolKey] = classFactory.name;
            ObjectPool.m_arrPool[iPoolKey] = [];
            ObjectPool.m_arrObject[iPoolKey] = [];
        }
        return iPoolKey;
    }

}
