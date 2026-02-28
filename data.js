const ARCHIVE_DATA = [
    {
        id: "SP_001",
        name: "SOIL_WASHED_OVERCOAT",
        status: "// [ AVAILABLE / 04 ]",
        category: "ORGANIC", // 核心新增：定义分类
        preview_img: "path/to/img1.jpg",
        report: {
            material: "TUSSAH SILK (柞蚕丝) / WILD HARVESTED",
            process: "30-DAY FULVIC ACID FERMENTATION / NATURAL OXIDATION",
            coords: "31.2304° N, 121.4737° E",
            notes: "纤维呈现半透明结晶质感，表面保留了泥土冲刷后的有机纹理。pH值趋于中性。"
        }
    },
    {
        id: "SP_002",
        name: "FIRE_GRASS_WEAVE",
        status: "// [ ARCHIVED ]",
        category: "MINERAL", // 核心新增：定义分类
        preview_img: "path/to/img2.jpg",
        report: {
            material: "WILD FIRE GRASS (火草) / HAND-TWISTED FIBER",
            process: "ASH-ALKALINE SCOURING / MANUAL COMPRESSION",
            coords: "25.0388° N, 102.7122° E",
            notes: "高度耐磨损结构。火草纤维与柞蚕丝交织，模拟了植物在地层中的压力演化。"
        }
    }
];