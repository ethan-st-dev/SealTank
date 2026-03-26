import { Behaviour, Rigidbody, IPointerEventHandler, PointerEventData, registerType } from "@needle-tools/engine";

@registerType
export class EasyGrab extends Behaviour implements IPointerEventHandler {
    
    private rb: Rigidbody | null = null;

    start() {
        this.rb = this.gameObject.getComponent(Rigidbody);
        if (!this.rb) {
            console.warn("EasyGrab: No Rigidbody found on", this.gameObject.name);
        } else {
            console.log("EasyGrab: Found Rigidbody on", this.gameObject.name, "isKinematic:", this.rb.isKinematic);
        }
    }

    onPointerDown(_pd: PointerEventData) {
        console.log("EasyGrab: onPointerDown", this.gameObject.name);
        if (this.rb) {
            console.log("EasyGrab: Setting kinematic=true, was:", this.rb.isKinematic);
            this.rb.isKinematic = true;
            this.rb.useGravity = false;
            this.rb.setVelocity(0, 0, 0);
            this.rb.setAngularVelocity(0, 0, 0);
            console.log("EasyGrab: After setting - kinematic:", this.rb.isKinematic, "useGravity:", this.rb.useGravity);
        }
    }

    onPointerUp(_pd: PointerEventData) {
        console.log("EasyGrab: onPointerUp", this.gameObject.name);
        if (this.rb) {
            this.rb.isKinematic = false;
            this.rb.useGravity = true;
            console.log("EasyGrab: Released - kinematic:", this.rb.isKinematic, "useGravity:", this.rb.useGravity);
        }
    }
}