// @flow
import {expect} from 'chai';

import {
    scenario,
    scenarios,
    setupForRspec,
    setupForAva,
    parametrized1,
    Stage,
} from '../src';

import {BasicScenarioGivenStage, BasicScenarioWhenStage, BasicScenarioThenStage} from './basic-stages';

if (global.describe && global.it) {
    setupForRspec(describe, it);
} else {
    const test = require('ava');
    setupForAva(test);
}

class ParametrizedScenarioGivenStage extends BasicScenarioGivenStage {
    a_parametrized_scenario_with_3_parts_and_3_cases(): this {
        class MyStage extends Stage {
            coffeePrice: number;
            a_coffee_that_costs_$_euros(coffeePrice: number): this {
                this.coffeePrice = coffeePrice;
                return this;
            }

            billedPrice: number;
            billed(): this {
                this.billedPrice = this.coffeePrice;
                return this;
            }

            the_billed_price_is_$_euros(billedPrice: number): this {
                expect(this.billedPrice).to.equal(billedPrice);
                return this;
            }
        }
        this.scenarioRunner.scenarios('group_name', MyStage, ({given, when, then}) => {
            return {
                scenario_name: scenario({}, parametrized1([1,2,3], (coffeeValue) => {
                    given().a_coffee_that_costs_$_euros(coffeeValue);
                    when().billed();
                    then().the_billed_price_is_$_euros(coffeeValue);
                })),
            };
        });
        return this;
    }
}

class ParametrizedScenarioThenStage extends BasicScenarioThenStage {
    the_scenario_contains_3_cases(): this {
        const cases = this.getScenario().cases;
        expect(cases).to.have.length(3);
        return this;
    }

    each_case_contains_3_parts(): this {
        const cases = this.getScenario().cases;
        const partLengthPerCase = cases.map(c => c.parts.length);
        expect(partLengthPerCase).to.deep.equal([3,3,3]);
        return this;
    }

    the_given_part_contains_a_word_including_the_parameter_name(): this {
        const cases = this.getScenario().cases;
        cases.forEach(c => {
            const part = this.findPartByKindInCase(c, 'GIVEN');
            const [step] = part.steps;
            const wordWithParameter = step.words.find(word => !! word.parameterName);
            expect(wordWithParameter).to.exist;
            if (wordWithParameter) {
                expect(wordWithParameter.parameterName).to.equal('coffeeValue');
            }
        });
        return this;
    }
}

scenarios('core.scenarios.parametrized', [ParametrizedScenarioGivenStage, BasicScenarioWhenStage, ParametrizedScenarioThenStage], ({given, when, then}) => ({
    scenarios_can_be_parametrized: scenario({}, () => {
        given()
            .a_scenario_runner().and()
            .a_parametrized_scenario_with_3_parts_and_3_cases();

        when().the_scenario_is_executed();

        then()
            .the_it_method_has_been_called_$_times_with_parameters_$(3, ['Scenario name #1', 'Scenario name #2', 'Scenario name #3']).and()
            .the_report_for_this_scenerio_has_been_generated().and()
            .the_scenario_contains_3_cases().and()
            .each_case_contains_3_parts().and()
            .the_given_part_contains_a_word_including_the_parameter_name();
    }),
}));