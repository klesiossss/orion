import { readDesignArtifact, writeDesignArtifact } from './artifact-store.js';
import { array, integer, list, member, record, string, strings } from './parse.js';
export const PAGE_LAYOUT_FAMILIES = [
    'hero',
    'about',
    'feature',
    'how_it_works',
    'social_proof',
    'stats',
    'faq',
    'cta',
    'pricing',
    'contact',
    'footer',
];
export const PAGE_MOTION_PURPOSES = [
    'none',
    'feedback',
    'state_change',
    'spatial_continuity',
    'explanation',
    'status',
];
export const PAGE_MOTION_TRIGGERS = [
    'none',
    'load',
    'scroll_enter',
    'scroll_progress',
    'hover',
    'press',
    'drag',
    'state_change',
];
export function parsePageBlueprint(value) {
    const blueprint = record(value, 'page blueprint');
    if (blueprint.version !== 1)
        throw new Error('page blueprint version must be 1');
    const page = record(blueprint.page, 'page');
    const architecture = blueprint.architecture === undefined
        ? undefined
        : record(blueprint.architecture, 'architecture');
    const sections = array(blueprint.sections, 'sections').map((value, index) => {
        const section = record(value, `sections[${index}]`);
        const copy = record(section.copy, `sections[${index}].copy`);
        return {
            id: string(section.id, `sections[${index}].id`),
            ...(!(section.layoutFamily === undefined)
                ? {
                    layoutFamily: member(section.layoutFamily, PAGE_LAYOUT_FAMILIES, `sections[${index}].layoutFamily`),
                }
                : {}),
            ...(!(section.layoutCases === undefined)
                ? {
                    layoutCases: strings(section.layoutCases, `sections[${index}].layoutCases`),
                }
                : {}),
            ...(!(section.referenceDirectionId === undefined)
                ? {
                    referenceDirectionId: string(section.referenceDirectionId, `sections[${index}].referenceDirectionId`),
                }
                : {}),
            purpose: string(section.purpose, `sections[${index}].purpose`),
            userQuestion: section.userQuestion === undefined
                ? string(section.purpose, `sections[${index}].purpose`)
                : string(section.userQuestion, `sections[${index}].userQuestion`),
            stage: section.stage === undefined
                ? 'explain'
                : member(section.stage, [
                    'orient',
                    'qualify',
                    'evaluate',
                    'prove',
                    'explain',
                    'de_risk',
                    'act',
                    'continue',
                ], `sections[${index}].stage`),
            dependencies: section.dependencies === undefined
                ? []
                : strings(section.dependencies, `sections[${index}].dependencies`),
            evidence: section.evidence === undefined
                ? []
                : strings(section.evidence, `sections[${index}].evidence`),
            copy: {
                ...(copy.eyebrow === undefined
                    ? {}
                    : { eyebrow: string(copy.eyebrow, `sections[${index}].copy.eyebrow`) }),
                heading: string(copy.heading, `sections[${index}].copy.heading`),
                body: strings(copy.body, `sections[${index}].copy.body`),
                callsToAction: links(copy.callsToAction, `sections[${index}].copy.callsToAction`),
            },
            layout: string(section.layout, `sections[${index}].layout`),
            ...(!(section.motion === undefined)
                ? {
                    motion: parseMotion(section.motion, index),
                }
                : {}),
            componentNeeds: strings(section.componentNeeds, `sections[${index}].componentNeeds`),
            assetNeeds: strings(section.assetNeeds, `sections[${index}].assetNeeds`),
            transformation: section.transformation === undefined
                ? {
                    compact: 'Preserve the section content in logical source order.',
                    medium: 'Preserve the section hierarchy with reduced simultaneity.',
                    expanded: string(section.layout, `sections[${index}].layout`),
                }
                : transformation(section.transformation, index),
        };
    });
    if (new Set(sections.map((section) => section.id)).size !== sections.length) {
        throw new Error('page blueprint section ids must be unique');
    }
    const sectionIds = new Set(sections.map((section) => section.id));
    for (const [index, section] of sections.entries()) {
        if (section.dependencies.includes(section.id)) {
            throw new Error(`section ${section.id} cannot depend on itself`);
        }
        const missing = section.dependencies.find((dependency) => !sectionIds.has(dependency));
        if (missing)
            throw new Error(`section ${section.id} depends on unknown section ${missing}`);
        const later = section.dependencies.find((dependency) => sections.findIndex(({ id }) => id === dependency) >= index);
        if (later)
            throw new Error(`section ${section.id} must follow dependency ${later}`);
    }
    return {
        version: 1,
        page: {
            title: string(page.title, 'page.title'),
            route: route(page.route),
            description: string(page.description, 'page.description'),
        },
        architecture: architecture
            ? {
                contract: string(architecture.contract, 'architecture.contract'),
                mode: member(architecture.mode, [
                    'scan_compare',
                    'read_understand',
                    'persuade_convert',
                    'explore_experience',
                    'operate_monitor',
                ], 'architecture.mode'),
                novelty: member(architecture.novelty, ['low', 'medium', 'high'], 'architecture.novelty'),
                grid: string(architecture.grid, 'architecture.grid'),
                signatureRule: string(architecture.signatureRule, 'architecture.signatureRule'),
                rhythm: string(architecture.rhythm, 'architecture.rhythm'),
            }
            : {
                contract: string(page.description, 'page.description'),
                mode: 'persuade_convert',
                novelty: 'medium',
                grid: 'Use the recorded section layouts.',
                signatureRule: 'No signature composition recorded.',
                rhythm: 'Preserve the recorded section order.',
            },
        navigation: links(blueprint.navigation, 'navigation'),
        ...(!(blueprint.navigationDesign === undefined)
            ? {
                navigationDesign: parseNavigationDesign(blueprint.navigationDesign),
            }
            : {}),
        sections,
        responsive: strings(blueprint.responsive, 'responsive'),
        interactions: strings(blueprint.interactions, 'interactions'),
        acceptanceCriteria: strings(blueprint.acceptanceCriteria, 'acceptanceCriteria'),
    };
}
function parseNavigationDesign(value) {
    const navigation = record(value, 'navigationDesign');
    const responsive = record(navigation.transformation, 'navigationDesign.transformation');
    return {
        ...(!(navigation.layoutCase === undefined)
            ? {
                layoutCase: string(navigation.layoutCase, 'navigationDesign.layoutCase'),
            }
            : {}),
        layout: string(navigation.layout, 'navigationDesign.layout'),
        behavior: strings(navigation.behavior, 'navigationDesign.behavior'),
        transformation: {
            compact: string(responsive.compact, 'navigationDesign.transformation.compact'),
            medium: string(responsive.medium, 'navigationDesign.transformation.medium'),
            expanded: string(responsive.expanded, 'navigationDesign.transformation.expanded'),
        },
    };
}
function transformation(value, index) {
    const item = record(value, `sections[${index}].transformation`);
    return {
        compact: string(item.compact, `sections[${index}].transformation.compact`),
        medium: string(item.medium, `sections[${index}].transformation.medium`),
        expanded: string(item.expanded, `sections[${index}].transformation.expanded`),
    };
}
function parseMotion(value, index) {
    const motion = record(value, `sections[${index}].motion`);
    const purpose = member(motion.purpose, PAGE_MOTION_PURPOSES, `sections[${index}].motion.purpose`);
    const trigger = member(motion.trigger, PAGE_MOTION_TRIGGERS, `sections[${index}].motion.trigger`);
    const durationMs = integer(motion.durationMs, `sections[${index}].motion.durationMs`, 0, 1200);
    if (purpose === 'none' && (trigger !== 'none' || durationMs !== 0)) {
        throw new Error(`sections[${index}].motion none must use trigger none and durationMs 0`);
    }
    if (purpose !== 'none' && (trigger === 'none' || durationMs < 80)) {
        throw new Error(`sections[${index}].motion requires a trigger and 80-1200ms duration`);
    }
    return {
        purpose,
        trigger,
        behavior: string(motion.behavior, `sections[${index}].motion.behavior`),
        durationMs,
        easing: string(motion.easing, `sections[${index}].motion.easing`),
        reducedMotion: string(motion.reducedMotion, `sections[${index}].motion.reducedMotion`),
    };
}
export function readPageBlueprint(workspacePath) {
    return parsePageBlueprint(readDesignArtifact(workspacePath, 'page.json'));
}
export function writePageBlueprint(workspacePath, value) {
    const blueprint = parsePageBlueprint(value);
    writeDesignArtifact(workspacePath, 'page.json', blueprint);
    return blueprint;
}
function links(value, field) {
    return list(value, field).map((value, index) => {
        const link = record(value, `${field}[${index}]`);
        return {
            label: string(link.label, `${field}[${index}].label`),
            target: string(link.target, `${field}[${index}].target`),
        };
    });
}
function route(value) {
    const result = string(value, 'page.route');
    if (!result.startsWith('/'))
        throw new Error('page.route must start with /');
    return result;
}
//# sourceMappingURL=page.js.map