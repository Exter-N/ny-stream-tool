import { isObs } from '../obs';
import { light } from '../scene/curtain';
import { currentRailPositions, HORIZ_SPRINGS, moveRailVertex, setWindAngleOffset, setWindMaxStrength } from '../scene/curtain/curtain';
import { material } from '../scene/main/curtain';
import settings, { setSetting, settingsAddOnChange } from './settings';

let updating = false;

settingsAddOnChange('curtainLeftX', value => {
    if (updating) {
        return;
    }
    updating = true;
    try {
        moveRailVertex(0, value);
        const right = currentRailPositions[HORIZ_SPRINGS * 2];
        if (isObs && settings.curtainRightX !== right) {
            setSetting('curtainRightX', right);
        }
    } finally {
        updating = false;
    }
});

settingsAddOnChange('curtainRightX', value => {
    if (updating) {
        return;
    }
    updating = true;
    try {
        moveRailVertex(HORIZ_SPRINGS, value);
        const left = currentRailPositions[0];
        if (isObs && settings.curtainLeftX !== left) {
            setSetting('curtainLeftX', left);
        }
    } finally {
        updating = false;
    }
});

settingsAddOnChange('curtainLightX', value => {
    light.position.x = value;
});

settingsAddOnChange('curtainLightIntensity', value => {
    light.intensity = value;
});

settingsAddOnChange('curtainWindMaxStrength', value => {
    setWindMaxStrength(value);
});

settingsAddOnChange('curtainWindAngleOffset', value => {
    setWindAngleOffset(value);
});

settingsAddOnChange('curtainOpacity', value => {
    material.opacity = value;
});