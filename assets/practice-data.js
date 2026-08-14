/* 实践任务数据：新增任务只需往 PRACTICE_TASKS 里加一项 */
var PRACTICE_TASKS = [
  {
    id: "colabfold-first",
    title: "ColabFold 第一次结构预测",
    stage: "阶段 1 · 预测",
    est: "约 30 分钟",
    desc: "跑通你人生第一次蛋白结构预测：输入一条序列，得到预测 PDB，并学会读 pLDDT / pTM / PAE。",
    steps: [
      {
        title: "准备一条氨基酸序列",
        dur: "2 分钟",
        body: "用一条你熟悉的序列开始。推荐：绿色荧光蛋白 GFP（UniProt P42212），或者你研究里的蛋白。格式要 FASTA：第一行 <code>&gt;名字</code>，下面一行是序列。长度 100–400 个氨基酸最合适。",
        expect: "你手里有一条以 <code>&gt;</code> 开头的文本序列。",
        errors: [
          { q: "怎么找到序列？", a: "去 UniProt 搜蛋白名，打开条目后点 FASTA 页签复制即可。" },
          { q: "序列太长怎么办？", a: "先用全长也可以，但预测会更慢。想快就截一个结构域。" }
        ],
        link: { label: "去 UniProt 找序列", url: "https://www.uniprot.org" }
      },
      {
        title: "在电脑浏览器打开 ColabFold",
        dur: "1 分钟",
        body: "打开下方链接，这是官方 ColabFold 笔记本（AlphaFold2 加速版，免费、无需安装）。建议在 Chrome 或 Edge 里打开。",
        expect: "出现 Google Colab 页面，标题是 AlphaFold2.ipynb。",
        errors: [
          { q: "打不开 / 白屏？", a: "换 Chrome 或 Edge 重试；网络环境不稳定时刷新几次。" },
          { q: "提示需要登录 Google？", a: "用你的 Google 账号登录，免费。" }
        ],
        link: { label: "打开 ColabFold", url: "https://colab.research.google.com/github/sokrypton/ColabFold/blob/main/AlphaFold2.ipynb" }
      },
      {
        title: "连接 GPU 并运行",
        dur: "3 分钟",
        body: "点菜单 <strong>Runtime（运行时）→ Change runtime type（更改运行时类型）</strong>，把 Hardware accelerator（硬件加速器）选成 <strong>GPU</strong>，保存。然后点 <strong>Runtime → Run all（全部运行）</strong>。",
        expect: "页面顶部的 cell 依次开始运行，第一个 cell 安装依赖需要 1–3 分钟。",
        errors: [
          { q: "提示 GPU 不可用 / 受限？", a: "免费 GPU 偶尔排队或限流，等几分钟重试，或先用 CPU 跑小序列。" }
        ]
      },
      {
        title: "粘贴你的序列",
        dur: "2 分钟",
        body: "滚动到填写 <code>query_sequence</code> 的 cell，把第 1 步准备的 FASTA 粘贴进去，顺便给 <code>jobname</code> 起个名字（比如 <code>my_first</code>）。",
        expect: "输入框里是 <code>&gt;名字</code> 开头、下面紧跟序列的文本。",
        errors: [
          { q: "序列格式不对？", a: "确认第一行以 &gt; 开头且没有多余空格，序列里只含 20 种氨基酸字母。" }
        ]
      },
      {
        title: "运行预测（MSA + 模型）",
        dur: "2–8 分钟",
        body: "回顶部点 <strong>Run all</strong> 继续。程序先搜索同源序列（MMseqs2），再跑 AlphaFold 模型输出结构。",
        expect: "日志最后出现 Done!，页面下方出现彩色 pLDDT 图，浏览器自动下载一个 zip。",
        errors: [
          { q: "MMseqs2 报错？", a: "重新运行安装 cell，或刷新页面后从头 Run all。" },
          { q: "没有自动下载？", a: "在输出区找下载链接手动点一下。" }
        ]
      },
      {
        title: "找到结果文件",
        dur: "2 分钟",
        body: "解压下载的 zip，里面有：<code>*_predicted_aligned_error_v1.json</code>（PAE 矩阵）、<code>*_scores_rank_001_*.json</code>（pLDDT 等分数）、<code>*_unrelaxed_rank_001_*.pdb</code>（预测结构）。",
        expect: "解压后能看到 .pdb 和 .json 文件。",
        errors: [
          { q: "zip 打不开？", a: "macOS 双击解压即可；Windows 用右键解压。" }
        ]
      },
      {
        title: "在 PyMOL / ChimeraX 里打开结构",
        dur: "5 分钟",
        body: "用 PyMOL 或 ChimeraX 打开 <code>*_unrelaxed_rank_001_*.pdb</code>。ChimeraX：File → Open；PyMOL：File → Open。然后切到 cartoon（卡通）模式看骨架。",
        expect: "看到完整的三维结构，可以旋转查看。",
        link: { label: "下载 ChimeraX（免费）", url: "https://www.cgl.ucsf.edu/chimerax/" }
      },
      {
        title: "读懂 pLDDT（置信度）",
        dur: "5 分钟",
        body: "pLDDT 是每个残基的置信度（0–100）：<strong>&gt;90</strong> 非常可信（核心折叠区域）；<strong>70–90</strong> 可信；<strong>50–70</strong> 较低（loop / 柔性区）；<strong>&lt;50</strong> 基本不可信（可能无序）。Colab 的彩色图：蓝=高，红=低。",
        expect: "你蛋白的核心区域应该是蓝色/青色，表面 loop 可能偏黄。",
        errors: [
          { q: "整条都是红的？", a: "说明这个蛋白可能是天然无序蛋白，或序列有问题。换一个已知折叠的蛋白试试。" }
        ]
      },
      {
        title: "检查 pTM 和 PAE",
        dur: "3 分钟",
        body: "在 scores json 里找 <code>ptm</code> 字段：<strong>&gt;0.8</strong> 说明整体折叠可信。PAE 矩阵图里，对角线附近的蓝色方块表示这些区域之间的相对位置可靠。",
        expect: "对球状蛋白，pTM 通常 &gt;0.8；PAE 图上有明显的蓝色区块。",
        errors: [
          { q: "pTM 只有 0.5？", a: "整体置信度低，可能是多结构域蛋白的域间相对位置不确定，单体内部结构仍可能可用。" }
        ]
      },
      {
        title: "保存你的第一个预测",
        dur: "3 分钟",
        body: "把结构截图 + pTM/pLDDT 记录存到你的项目文件夹（比如 <code>~/Desktop/2026/蛋白设计/colabfold-first/</code>）。命名带日期，方便以后回看。任务完成！",
        expect: "一份属于你的预测结构文件和一条实验记录。",
        tip: "下一个任务：把预测出的 PDB 当骨架，用 ProteinMPNN 设计新序列。"
      }
    ]
  },
  {
    id: "proteinmpnn-first",
    title: "ProteinMPNN 第一次序列设计",
    stage: "阶段 1 · 设计",
    est: "约 40 分钟",
    desc: "第一次真正“设计”蛋白：给定一个骨架结构，让 ProteinMPNN 生成能折叠成它的新序列，再用 ColabFold 回测验证。",
    steps: [
      {
        title: "准备一个骨架 PDB",
        dur: "3 分钟",
        body: "用上一个任务预测出的 PDB，或下载一个现成结构（比如泛素 1UBQ）。这个结构就是你的“骨架”——序列设计就是给这个骨架配新序列。",
        expect: "本地有一个 .pdb 文件。",
        link: { label: "从 RCSB 下载 1UBQ", url: "https://www.rcsb.org/structure/1UBQ" }
      },
      {
        title: "打开 ProteinMPNN Colab",
        dur: "1 分钟",
        body: "打开官方 ProteinMPNN 笔记本（逆折叠模型：给定骨架生成序列）。建议用 Chrome/Edge。",
        expect: "出现 Colab 页面，标题 ProteinMPNN。",
        link: { label: "打开 ProteinMPNN", url: "https://colab.research.google.com/github/dauparas/ProteinMPNN/blob/main/helper_scripts/colab_notebooks/ProteinMPNN.ipynb" }
      },
      {
        title: "连接 GPU 并安装依赖",
        dur: "3 分钟",
        body: "菜单 <strong>Runtime → Change runtime type</strong> 选 GPU（可选，小蛋白 CPU 也能跑），然后 <strong>Runtime → Run all</strong>。",
        expect: "安装 cell 运行完成，无红色报错。",
        errors: [
          { q: "报错说找不到文件？", a: "先别急，下一步上传文件后再运行后续 cell。" }
        ]
      },
      {
        title: "上传骨架 PDB",
        dur: "2 分钟",
        body: "在对应 cell 里点击上传按钮（或按 notebook 提示把文件放到指定路径），上传第 1 步的 PDB。",
        expect: "上传成功后能看到文件名，后续 cell 能读到它。",
        errors: [
          { q: "上传按钮在哪里？", a: "Colab 左侧文件面板也可以拖拽上传。" }
        ]
      },
      {
        title: "设置采样参数",
        dur: "3 分钟",
        body: "常用参数：<code>num_seq_per_target = 8</code>（采样 8 条序列）、<code>sampling_temp = \"0.1\"</code>（越低越保守）。第一次跑全部用默认也行。如果想保留功能残基，在 fixed residues 里填位置（1 开始）。",
        expect: "参数 cell 里能看到 8 条采样的设置。",
        tip: "temperature=0.1 是论文推荐的高成功率区间；想探索多样性再调高。"
      },
      {
        title: "运行序列设计",
        dur: "3–8 分钟",
        body: "运行设计 cell。ProteinMPNN 会为每个骨架位置计算氨基酸概率并采样序列。",
        expect: "输出多条 FASTA 候选序列，长度和骨架残基数一致。",
        errors: [
          { q: "序列比预期短？", a: "检查 PDB 是否只包含你想要的链（去水、去配体后重试）。" }
        ]
      },
      {
        title: "挑选候选序列",
        dur: "5 分钟",
        body: "先删掉含 <code>*</code>（终止密码子）的序列；再看有没有保留你需要的固定残基。把 top 1–3 条复制保存。",
        expect: "3 条左右看起来“正常”的蛋白序列。",
        errors: [
          { q: "所有序列都带 *？", a: "可能 PDB 里有断链/非标准残基，换一个干净骨架（如 1UBQ）重试。" }
        ]
      },
      {
        title: "自洽性检查（关键一步）",
        dur: "10 分钟",
        body: "把选中的序列拿回 ColabFold（任务 1 的流程）预测结构，然后在 ChimeraX 里用 <strong>Matchmaker</strong> 把预测结构和你的骨架叠合。两者越像，说明这条序列越可能真折叠成目标结构。",
        expect: "预测结构与骨架基本重叠，backbone RMSD 越小越好。",
        tip: "这就是“设计 → 预测回测”闭环（self-consistency check），现代设计流水线的标准操作。"
      },
      {
        title: "记录与存档",
        dur: "3 分钟",
        body: "把序列、参数（temperature、固定残基）、回测截图存到项目文件夹，命名带日期。",
        expect: "一份可复现的设计记录。",
        errors: [
          { q: "为什么要记录参数？", a: "设计实验的失败分析最依赖完整元数据，将来写论文也要交代。" }
        ]
      },
      {
        title: "完成：进入下一关",
        dur: "1 分钟",
        body: "恭喜！你已经走完“骨架 → 序列 → 回测”的最小闭环。下一关：用 RFdiffusion 生成全新骨架 + ProteinMPNN 设计序列，做真正的从头设计（de novo design）。",
        expect: "理解现代设计三步流水线：生成骨架 → 设计序列 → 回测验证。",
        tip: "文献页的 ProteinMPNN（2022）和 RFdiffusion（2023）论文值得现在开始精读。"
      }
    ]
  }
];
