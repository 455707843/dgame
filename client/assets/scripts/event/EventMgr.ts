export default class EventMgr
{
    private m_mapCallBack: Map<number,Array<EventObject>>;
    private m_arrEventObject: Array<EventObject>;

    constructor()
    {
        this.m_mapCallBack = new Map<number,Array<EventObject>>();
        this.m_arrEventObject = new Array<EventObject>();
        for(let i: number = 0;i < 100;i++)
        {
            this.m_arrEventObject.push(new EventObject());
        }
    }

    public emit(type: number,data: any): void
    {
        let arrEvent: Array<EventObject> = this.m_mapCallBack.get(type);
        if(arrEvent && arrEvent.length > 0)
        {
            let len: number = arrEvent.length;
            for(let i: number = 0;i < len;i++)
            {
                arrEvent[i].callBack.call(arrEvent[i].target,data);
            }
        }
    }

    public bind(type: number,callBack: Function,target: any): void
    {
        let arrEvent: Array<EventObject> = this.m_mapCallBack.get(type);
        if(!arrEvent)
        {
            arrEvent = [];
            this.m_mapCallBack.set(type,arrEvent);
        }
        for(let i: number = 0;i < arrEvent.length;i++)
        {
            if(arrEvent[i].target == target && arrEvent[i].callBack == callBack)
            {
                return;
            }
        }
        let eventObject: EventObject = this.m_arrEventObject.pop();
        if(!eventObject)
        {
            eventObject = new EventObject();
        }
        eventObject.eventId = type;
        eventObject.target = target;
        eventObject.callBack = callBack;
        arrEvent.push(eventObject);
    }

    public unbind(type: number,callBack: Function,target: any): void
    {
        let arrEvent: Array<EventObject> = this.m_mapCallBack.get(type);
        if(arrEvent && arrEvent.length > 0)
        {
            let len: number = arrEvent.length;
            for(let i: number = 0;i < len;i++)
            {
                if(arrEvent[i].target == target && arrEvent[i].callBack == callBack)
                {
                    arrEvent[i] = arrEvent[len - 1];
                    break;
                }
            }
            arrEvent.length--;
        }
    }

    public unbindTarget(target: any): void
    {
        this.m_mapCallBack.forEach((value,key) =>
        {
            if(value && value.length > 0)
            {
                for(let i: number = 0;i < value.length;i++)
                {
                    if(value[i].target == target)
                    {
                        value[i] = value[value.length - 1];
                        value.length--;
                    }
                }
            }
        })
    }
}

class EventObject
{
    eventId: number;
    target: any;
    callBack: Function;
}

export class EventID
{
    public static id: number = 1000000;
    public static get CreateID(): number
    {
        return ++EventID.id;
    }

    public static readonly BattleEvent = {
        START_BATTLE: EventID.CreateID,
    }
}