/**
 * WITCH & WARD — Actor data models (CORE-RULES "Characters", "The threat").
 */
import { WW } from "./config.mjs";

const fields = () => foundry.data.fields;

export class WitchData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const f = fields();
    const rating = initial => new f.NumberField({ required: true, integer: true, min: 0, max: 4, initial });
    return {
      heart: rating(2), wits: rating(2), nerve: rating(2), craft: rating(1),
      power: new f.StringField({ required: true, initial: "force", choices: WW.powerOrder }),
      life: new f.StringField({ initial: "" }),
      tie: new f.StringField({ initial: "" }),
      look: new f.StringField({ initial: "" }),
      hurt: new f.NumberField({ required: true, integer: true, min: 0, max: WW.witchHurt, initial: 0 }),
      magic: new f.NumberField({ required: true, integer: true, min: 0, initial: WW.startMagic }),
      lifeAnswered: new f.BooleanField({ initial: false }),
      surgeUsed: new f.BooleanField({ initial: false }),
      scar: new f.BooleanField({ initial: false }),
      notes: new f.StringField({ initial: "" }),
    };
  }
  get hurtMax() { return WW.witchHurt; }
  get down() { return this.hurt >= WW.witchHurt; }
}

export class GuardianData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const f = fields();
    const rating = initial => new f.NumberField({ required: true, integer: true, min: 0, max: 4, initial });
    return {
      heart: rating(3), wits: rating(2), nerve: rating(2),
      hurt: new f.NumberField({ required: true, integer: true, min: 0, max: WW.guardianHurt, initial: 0 }),
      ward: new f.NumberField({ required: true, integer: true, min: 0, initial: WW.startWard }),
      look: new f.StringField({ initial: "" }),
      notes: new f.StringField({ initial: "" }),
    };
  }
  get hurtMax() { return WW.guardianHurt; }
  get down() { return this.hurt >= WW.guardianHurt; }
}

export class ThreatData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const f = fields();
    return {
      what: new f.StringField({ initial: "" }),
      plan: new f.StringField({ initial: "" }),
      weakness: new f.StringField({ initial: "" }),
      hiddenPlace: new f.StringField({ initial: "" }),
      publicPlace: new f.StringField({ initial: "" }),
      signature: new f.StringField({ initial: "Attacks two different characters." }),
      signatureIsAttack: new f.BooleanField({ initial: true }),
      notes: new f.StringField({ initial: "" }),
    };
  }
}

/** Anyone else: the innocent, witnesses, bystanders (story only: no ratings). */
export class PersonData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const f = fields();
    return {
      role: new f.StringField({ initial: "bystander", choices: ["innocent", "witness", "bystander"] }),
      look: new f.StringField({ initial: "" }),
      notes: new f.StringField({ initial: "" }),
    };
  }
}
