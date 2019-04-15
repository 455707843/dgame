import Core from "../Core";

const {ccclass} = cc._decorator;

@ccclass
export default class Game extends cc.Component
{
    start()
    {
        cc.game.addPersistRootNode(cc.find("PersistNode"));
        Core.Init(this.node);
    }
}