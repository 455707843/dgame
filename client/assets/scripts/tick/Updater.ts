import Core from "../Core";

const {ccclass} = cc._decorator;
@ccclass
export default class Updater extends cc.Component
{
    start()
    {
    }
    public update(dt: number): void
    {
        Core.Update(dt);
    }
}
