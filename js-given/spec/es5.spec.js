// @flow
import { expect } from 'chai';

import {
    scenario,
    scenarios,
    setupForRspec,
    setupForAva,
    Stage,
    State,
} from '../src';

import {BasicScenarioGivenStage, BasicScenarioWhenStage, BasicScenarioThenStage} from './basic-stages';

if (global.describe && global.it) {
    setupForRspec(describe, it);
} else {
    const test = require('ava');
    setupForAva(test);
}

class ES5GivenStage extends BasicScenarioGivenStage {
    @State calledRecorder: {
        called: boolean;
    };
    ES5Stage: Class<any>;
    ES5GivenStage: Class<any>;
    ES5WhenStage: Class<any>;
    ES5ThenStage: Class<any>;

    an_es5_stage_class(): this {
        this.calledRecorder = {
            called: false,
        };
        const self = this;

        function ES5Stage() {
        }
        ES5Stage.prototype = {
            an_action_is_performed() {
                self.calledRecorder.called = true;
            },
        };
        Object.setPrototypeOf(ES5Stage.prototype, Stage.prototype);
        Object.setPrototypeOf(ES5Stage, Stage);

        this.ES5Stage = ES5Stage;

        return this;
    }

    a_scenario_that_uses_this_stage_class(): this {
        this.scenarioRunner.scenarios('group_name', this.ES5Stage, ({given, when, then}) => {
            return {
                scenario_using_stages: scenario({}, () => {
                    given();
                    when().an_action_is_performed();
                    then();
                }),
            };
        });
        return this;
    }

    three_state_full_es5_stage_classes(): this {
        this.calledRecorder = {
            called: false,
        };
        const self = this;

        function ES5GivenStage() {
        }
        ES5GivenStage.prototype = {
            a_number: function (value: number) {
                this.value = value;
            },
        };
        Object.setPrototypeOf(ES5GivenStage.prototype, Stage.prototype);
        Object.setPrototypeOf(ES5GivenStage, Stage);
        // $FlowIgnore
        State.addProperty(ES5GivenStage, 'value');
        this.ES5GivenStage = ES5GivenStage;

        function ES5WhenStage() {
        }
        ES5WhenStage.prototype = {
            it_is_incremented() {
                this.value++;
            },
        };
        Object.setPrototypeOf(ES5WhenStage.prototype, Stage.prototype);
        Object.setPrototypeOf(ES5WhenStage, Stage);
        // $FlowIgnore
        State.addProperty(ES5WhenStage, 'value');
        this.ES5WhenStage = ES5WhenStage;

        function ES5ThenStage() {
        }
        ES5ThenStage.prototype = {
            its_new_value_is(value: number) {
                expect(this.value).to.equal(value);
                self.calledRecorder.called = true;
            },
        };
        Object.setPrototypeOf(ES5ThenStage.prototype, Stage.prototype);
        Object.setPrototypeOf(ES5ThenStage, Stage);
        // $FlowIgnore
        State.addProperty(ES5ThenStage, 'value');
        this.ES5ThenStage = ES5ThenStage;

        return this;
    }

    a_scenario_that_uses_these_stage_classes(): this {
        this.scenarioRunner.scenarios('group_name', [this.ES5GivenStage, this.ES5WhenStage, this.ES5ThenStage], ({given, when, then}) => {
            return {
                scenario_using_stages: scenario({}, () => {
                    given().a_number(1);
                    when().it_is_incremented();
                    then().its_new_value_is(2);
                }),
            };
        });
        return this;
    }
}

class ES5ThenStage extends BasicScenarioThenStage {
    @State calledRecorder: {
        called: boolean;
    };

    the_es_5_stage_has_been_used(): this {
        expect(this.calledRecorder.called).to.be.true;
        return this;
    }
}


scenarios('core.support.es5', [ES5GivenStage, BasicScenarioWhenStage, ES5ThenStage], ({ given, when, then }) => {
    return {
        scenarios_can_use_an_es5_stage_class: scenario({}, () => {
            given().a_scenario_runner()
                .and().an_es5_stage_class()
                .and().a_scenario_that_uses_this_stage_class();

            when().the_scenario_is_executed();

            then().the_es_5_stage_has_been_used();
        }),

        scenarios_can_use_es5_stage_classes_and_share_state: scenario({}, () => {
            given().a_scenario_runner()
                .and().three_state_full_es5_stage_classes()
                .and().a_scenario_that_uses_these_stage_classes();

            when().the_scenario_is_executed();

            then().the_es_5_stage_has_been_used();
        }),
    };
});