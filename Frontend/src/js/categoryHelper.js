/* =============================================
   Maira Jewels - Centralized Category Helper
   Dynamic Category Resolution, Robust Matching & Counts
   ============================================= */

/**
 * Resolves raw category representation into a normalized object:
 * { name: string, categoryId: string, id: string, description: string }
 */
export function resolveCategory(catInput, categoriesList = []) {
    if (!catInput) {
        return { name: 'Fine Jewellery', categoryId: '', id: '', description: '' };
    }

    // If catInput is an object with name/categoryId
    if (typeof catInput === 'object' && catInput !== null) {
        const name = catInput.name || catInput.categoryName || catInput.title || '';
        const categoryId = catInput.categoryId || catInput.customId || catInput._id || '';
        const id = catInput._id || categoryId;
        const description = catInput.description || '';
        return { name: name || 'Fine Jewellery', categoryId, id, description };
    }

    const catStr = String(catInput).trim();
    if (!catStr) {
        return { name: 'Fine Jewellery', categoryId: '', id: '', description: '' };
    }

    // Attempt to match against known categories array
    if (Array.isArray(categoriesList) && categoriesList.length > 0) {
        const found = categoriesList.find(c => {
            if (!c) return false;
            if (typeof c === 'object') {
                return (c.categoryId && c.categoryId.toLowerCase() === catStr.toLowerCase()) ||
                       (c._id && c._id.toLowerCase() === catStr.toLowerCase()) ||
                       (c.name && c.name.toLowerCase() === catStr.toLowerCase());
            }
            return String(c).toLowerCase() === catStr.toLowerCase();
        });

        if (found) {
            if (typeof found === 'object') {
                return {
                    name: found.name || catStr,
                    categoryId: found.categoryId || found._id || '',
                    id: found._id || found.categoryId || '',
                    description: found.description || ''
                };
            }
            return { name: String(found), categoryId: '', id: '', description: '' };
        }
    }

    // Fallback: If catStr starts with 'CAT-', treat as Category ID
    return { name: catStr, categoryId: catStr.startsWith('CAT-') ? catStr : '', id: catStr, description: '' };
}

/**
 * Checks if a product's category matches a target category filter.
 * Handles category IDs, names, objects, case-insensitivity, singular/plural, and sub-categories.
 */
export function isCategoryMatch(productCat, targetCat, categoriesList = []) {
    if (!targetCat || targetCat === 'all' || targetCat === 'All' || targetCat === 'All Jewellery') {
        return true;
    }

    if (!productCat) return false;

    const prodRes = resolveCategory(productCat, categoriesList);
    const targetRes = resolveCategory(targetCat, categoriesList);

    const prodName = (prodRes.name || '').toLowerCase().trim();
    const targetName = (targetRes.name || String(targetCat)).toLowerCase().trim();

    const prodId = (prodRes.categoryId || prodRes.id || '').toLowerCase().trim();
    const targetId = (targetRes.categoryId || targetRes.id || String(targetCat)).toLowerCase().trim();

    // 1. Direct match on resolved Name or ID
    if (prodName === targetName) return true;
    if (prodId && targetId && prodId === targetId) return true;

    // 2. Raw string check
    const rawProdStr = (typeof productCat === 'string' ? productCat : (productCat.name || productCat.categoryId || '')).toLowerCase().trim();
    const rawTargetStr = String(targetCat).toLowerCase().trim();
    if (rawProdStr === rawTargetStr) return true;

    // 3. Special handling for Solitaires
    if (targetName === 'solitaire' || targetName === 'solitaires') {
        if (prodName.includes('solitaire') || rawProdStr.includes('solitaire')) return true;
    }

    // 4. Singular / Plural tolerance (e.g., "Necklace" vs "Necklaces", "Ring" vs "Rings", "Bracelet" vs "Bracelets")
    const stripS = s => s.replace(/s$/i, '').replace(/es$/i, '');
    if (stripS(prodName) === stripS(targetName)) return true;
    if (stripS(rawProdStr) === stripS(rawTargetStr)) return true;

    // 5. Compound / Substring matching (e.g. "Thin wrists bracelets" matches target "Bracelets")
    if (prodName.includes(targetName) || targetName.includes(prodName)) return true;
    if (rawProdStr.includes(rawTargetStr) || rawTargetStr.includes(rawProdStr)) return true;

    return false;
}

/**
 * Calculates product count per category for pills and sliders
 */
export function getCategoryCounts(products = [], categoriesList = []) {
    const counts = {};
    if (!Array.isArray(products)) return counts;

    products.forEach(p => {
        const res = resolveCategory(p.category, categoriesList);
        const key = res.name || 'Fine Jewellery';
        counts[key] = (counts[key] || 0) + 1;
    });

    return counts;
}

export default {
    resolveCategory,
    isCategoryMatch,
    getCategoryCounts
};
