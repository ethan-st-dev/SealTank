import { Behaviour, Rigidbody, IPointerEventHandler, PointerEventData, registerType } from "@needle-tools/engine";

@registerType
export class EasyGrab2 extends Behaviour implements IPointerEventHandler {
    
    private rb: Rigidbody | null = null;

    start() {
        this.rb = this.gameObject.getComponent(Rigidbody);
    }

    onPointerDown(_pd: PointerEventData) {
        if (this.rb) {
            // isKinematic = true stops gravity from pulling the object down/
            this.rb.isKinematic = true;
            this.rb.setVelocity(0, 0, 0);
        }
    }

    onPointerUp(_pd: PointerEventData) {
        if (this.rb) {
            // Return to normal physics when let go
            this.rb.isKinematic = false;
        }
    }
}