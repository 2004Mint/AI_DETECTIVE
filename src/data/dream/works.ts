/**
 * AI 造梦事务所 · 作品数据
 *
 * AI 视觉 10 件由后台 /admin 导出（2026/11/8 18:59）；
 * AI 文字 / AI 脑洞各 3 件是示例内容，先让展墙不空，可直接替换成真实作品；
 * AI 音乐 4 件由 Suno 生成（Bittersweet Momentum / Lingering Delay 各两个版本）。
 *
 * 图片放在 public/dream/works/，音频放在 public/dream/audio/。
 * 改了数据后跑一次 `npm run check:dream` 自检。
 */
import type { DreamWork } from '@/types/dream'

export const DREAM_WORKS: DreamWork[] = [
  {
    id: 'visual-10',
    title: '插画',
    category: 'visual',
    cover: 'visual-10.webp',
    tool: 'Qwen-image2.1',
    prompt: `分析该插画的叙事内容，并找出故事中最关键的命运瞬间。

[场景构建]

- 将该决定性瞬间重现为一张新插画

- 场景应呈现出抓拍感和非摆拍感——仿佛被相机意外捕捉到一样

- 主体处于动作进行中，且未察觉到被拍摄

- 构图略显失衡，仿佛摄影师移动得较为仓促

[深度与镜头]

- 在靠近镜头的前景处放置一个失焦物体——可以是树枝、织物、叶片、建筑元素或场景中原有的任何环境物体

- 前景中绝不能出现人手或人体部位

- 该前景元素旨在营造强烈的深度分离感

- 应用浅景深：焦点清晰，其余部分呈现自然的虚化效果

- 外围元素的轻微动态模糊暗示了瞬间的流逝

[瑕疵感]

- 构图不完美——主体可能略微偏离中心或被部分裁剪

- 对焦并非绝对精准——最清晰的点接近主体，但不过于刻板

- 图像给人的感觉就像是在“完美”镜头的前一秒或后一秒拍摄的

[氛围]

- 图像必须传达出故事转折点的情感重量

- 光影应反映出该时刻的张力

- 保留原插画的艺术风格和色彩调性`,
    voteCount: 0,
    createdAt: '2026-11-08T10:59:01.427Z',
  },
  {
    id: 'visual-09',
    title: '芒果椰乳冰饮手绘标注摄影',
    category: 'visual',
    cover: 'visual-09.webp',
    tool: 'Qwen-image2.1',
    prompt: '生成一杯明亮清透的主题饮品摄影，主杯放在视觉中心，玻璃杯以近距离实拍质感呈现，杯壁透明、边缘干净，底部有圆润小料和乳感基底，中段形成柔软的奶色云雾层，上方叠加由饮品主味材料决定的清晰浓缩色与冰块泡沫，液体层次自然扩散但不浑浊。画面最强机制是实拍饮品与粗黑手绘信息涂鸦叠在一起：用厚实松弛的黑色手写词、弧形箭头、短促放射线、虚线杯身轮廓和圈画标记，把底层乳感、上方主味、冰块与小料像随手课堂笔记一样标出来；涂鸦要有真实笔触的粗细变化和轻微不规则，压在画面前景，部分贴着杯沿和杯身走向，既像说明图又保留可爱手作感。背景保持浅色、柔软、生活化，桌面与布料只做轻量支撑，远处可有虚化的器皿和制作道具，但不能抢走杯子的视觉重量。色彩从饮品主题自身的材料、乳感基底、透明杯体和清洁桌面中提取：大面积高明度浅色负责通风感和洁净度，主味材料提供少量明亮清晰的情绪色，乳白与透明层负责柔和过渡，黑色手写线条负责信息结构和记忆点；整体要明亮轻快、清透新鲜，保持干净色阶、适度饱和、柔和自然光和玻璃液体的透明层次，避免灰脏、陈旧、烟雾化或过度复古。 —————— 画面主角：芒果椰乳冰饮，透明杯里有椰乳云雾层、芒果浓缩色和少量冰块泡沫 门店用途：适合夏季饮品菜单单品图，保持近距离实拍和黑色手绘箭头标注 保留要求：小料在杯底清楚可见，整体做成横版 16:9',
    voteCount: 0,
    createdAt: '2026-11-08T10:29:05.444Z',
  },
  {
    id: 'visual-08',
    title: '女性写实动漫城市街头',
    category: 'visual',
    cover: 'visual-08.webp',
    tool: 'Qwen-image2.1',
    prompt: '使用提供的参考图像，创作一张超写实的超现实街头时尚构图，采用俯视的鸟瞰视角，画面主体为一位时尚年轻女性，她站在一个嵌入城市人行道的 巨大的超大号智能手机音乐播放器界面上，营造出一种有趣的强制透视错觉。巨大的手机屏幕显示着现代音乐播放器 UI，包含专辑封面、播放控制、进度条以及深色主题下的极简界面元素。与巨大的手机相比，女性显得非常渺小，仿佛站在专辑封面上。她留着深色长发，扎着两条辫子，戴着黑色佩斯利花纹头巾，佩戴超大圆形眼镜、叠戴的银色项链（带有星星吊坠）、粗款手链，身穿前卫的 Y2K 风格黑色无袖上衣，并带有金属装饰。她搭配超大号深色工装短裤、白色袜子和棕褐色麂皮一脚蹬鞋。一个深酒红色皮质单肩包（配有银色五金件）随意地放在巨型手机旁边。在画面底部，加入摄影师本人的双脚，穿着宽松的深色牛仔裤和棕色麂皮鞋，以强化观众正俯视路面上超大设备的错觉。女性姿态俏皮，双手抬起调整眼镜，同时向上看向镜头。构图应呈现逼真的混凝土纹理、柔和的阴天光影、细腻的投影、照片级的皮肤和织物细节，以及干净的都市美学。风格：美学，Y2K 街头服饰，超现实透视错觉。负面提示词：低质量，模糊，解剖结构错误，多余的手指，多余的肢体，重复的人，透视扭曲，畸形的手，不切实际的比例，卡通，动漫，CGI，水印，Logo，随机文字，噪点图像，塑料质感皮肤，低分辨率，光线不佳，伪影，漂浮物体。风格关键词：强制透视，巨型智能手机错觉，超大号音乐播放器，Pinterest 美学，Y2K 时尚，韩系街头风格，创意摄影，鸟瞰视角，超现实写实主义，编辑概念，照片级真实，超细节，8K，Instagram 病毒式美学。',
    voteCount: 0,
    createdAt: '2026-11-08T10:27:57.155Z',
  },
  {
    id: 'visual-07',
    title: '女性电影感胶片山雨忧郁',
    category: 'visual',
    cover: 'visual-07.webp',
    tool: 'Qwen-image2.1',
    prompt: '一张电影感十足的抓拍照片，画面中一位 {argument name="person" default="年轻女性"} 站在阴天湿漉漉的沿海路边停车区。视角从后方及侧后方拍摄，她正回头看向镜头。她留着深色凌乱的头发，扎成松散的发髻，发丝被风吹乱，面部轮廓柔和且模糊。她身穿两件可见的衣物：一件磨损的棕褐色帆布夹克和一条中蓝色牛仔裤。她姿态放松，一只手放在口袋附近或口袋里。背景是忧郁的悬崖公路观景台，左侧是深色的岩石山脉，右侧是延伸至远方的灰白色大海，天空阴沉且泛白。画面右侧边缘包含 1 辆停放的浅色 80 年代末或 90 年代初轿车，车尾朝向观众，观景台附近有 1 个大型岩石护栏。沥青路面深暗潮湿，带有模糊的停车线，暗示着刚下过雨。采用自然光，色调柔和偏冷，带有轻微的胶片颗粒感、柔焦效果、淡淡的薄雾，呈现出怀旧的 35mm 公路旅行摄影美学。',
    voteCount: 0,
    createdAt: '2026-11-08T10:19:10.064Z',
  },
  {
    id: 'visual-06',
    title: 'HEAVEN ERROR｜故障天使',
    category: 'visual',
    cover: 'visual-06.webp',
    tool: 'Qwen-image2.1',
    prompt: `一张高完成度的日本动漫潮流角色海报，一位俏皮可爱的故障天使少女作为画面绝对主体，浅蓝色短发，齐刘海，红色异色瞳，一只眼睛俏皮眨眼，头顶悬浮着倾斜的白色光环，背后有一对小巧的白色天使翅膀。少女穿着超大号蓝白色机能飞行夹克、黑色百褶短裙、厚底机能靴，服装上布满拉链、金属扣、链条和兔子挂件。人物全身悬浮在空中，双手在脸颊旁比出剪刀手，吐舌头，姿态活泼俏皮。

背景采用黑白与冰蓝色分割的赛博网格设计，巨大的数字777、粗体英文标题、条形码、警告标识、扫描框、手绘星星、心形图标、箭头和技术线条交错排布。使用高对比度平面设计，角色与背景形成明显层次。

标题使用 HEAVEN ERROR，辅助文字 ANGEL GLITCH、ERROR 777、KEEP OUT、SYSTEM FAILURE。整体具有日本原宿潮流杂志、街头贴纸、游戏角色设定集的视觉气质。

精细动漫线稿，细腻皮肤质感，丰富服装褶皱，金属配件反光，清晰锐利的轮廓，精致赛璐璐与厚涂结合的上色方式，专业商业插画品质。`,
    voteCount: 0,
    createdAt: '2026-11-08T10:02:33.366Z',
  },
  {
    id: 'visual-05',
    title: '车胶片封面城市街头高级',
    category: 'visual',
    cover: 'visual-05.webp',
    tool: 'GPT Image',
    prompt: `夏日城市街头写真，一位年轻亚洲女生，长卷发，清透自然妆容，穿黑色系夏季穿搭，黑色吊带裙 / 黑色长裙 / 黑色无袖连衣裙，搭配黑色单肩包，站在树荫斑驳的斑马线和城市街道上，阳光从树叶缝隙洒下，形成柔和光斑和镜头光晕，画面有夏天微风感，头发被风吹起，人物表情自然有生命力，微笑、回眸、抬头看光、牵手向前走、挥手、旋转裙摆等动作，像朋友用相机在夏天街头抓拍。

整体风格为高级夏日杂志封面，清爽、明亮、柔焦、胶片感、轻微过曝，皮肤通透自然，不要塑料感，不要过度磨皮。背景是绿色树荫、城市马路、车辆虚化、斑马线，浅景深，真实街拍氛围。

画面加入英文杂志排版，大面积留白，高级 serif 字体与黄色手写涂鸦字体混排，字体有生命力，像夏天随手写下的笔记。加入小太阳、爱心、手绘线条、VOL 编号、SUMMER COLLECTION 2024 等元素。主标题可用：
“SUMMER SWAY”
“FOLLOW LIGHT”
“WAVE TO JOY”
“SOFT NOIR”
“SPIN IN SHADE”
“BLACK BLOOM”
“NOIR GLOW”
“SUNLIT NOIR”
“MIDNIGHT SUMMER”

副文案可用：
“CHASE THE LIGHT, LIVE IN THE NOW.”
“EASY DAYS, GENTLE LIGHT, ENDLESS YOUTH.”
“SUN ON MY SKIN, CARE IN MY SOUL.”
“BLACK ISN’T JUST A COLOR, IT’S A SUMMER STATE OF MIND.”
“LIGHT HEART. SOFT DAYS. ENDLESS SUMMER.”

摄影感：35mm 镜头，柔和阳光，电影感夏日街头摄影，杂志封面风格，梦幻胶片颗粒，自然皮肤质感，虚化光斑，镜头眩光，轻盈构图，高级时尚休闲风，竖版海报，4:5 比例。`,
    voteCount: 0,
    createdAt: '2026-11-08T09:48:12.824Z',
  },
  {
    id: 'visual-04',
    title: '女性动漫插画',
    category: 'visual',
    cover: 'visual-04.webp',
    tool: 'Qwen-image2.1',
    prompt: '一张柔和、低饱和度的单色动漫风格插画，描绘了一位在安静房间内慵懒休憩的疲惫年轻女性。画作采用细腻的草图线条和暖灰米色调的平涂阴影。她留着深棕色近乎黑色的长发，发丝凌乱，留着柔软的刘海，皮肤白皙，半睁的眼睛流露出疲惫感。她的表情显得心力交瘁、心不在焉，微微嘟着嘴，透出一种情感上的疲惫。她侧身瘫坐在椅子或沙发上，单手托腮，肘部支撑，姿态松弛自然，给人一种“全身力气都被抽干”的真实感。她穿着一件超大款深炭灰色露肩长袖卫衣，卫衣一侧滑落，露出单侧肩膀和锁骨，整体轮廓宽松。前景是一张圆桌，上面放着一个素色马克杯、2 个小纸包装或便签，以及 1 小块长方形巧克力。房间左侧的小桌面上摆放着一个简单的花瓶，插着几枝绿叶。墙上挂着一张小纸条，写着“おつかれわたし”（辛苦了，我自己）。她头顶附近的对话框写着“なんもしたくな〜い”（什么都不想做）。构图垂直且亲密，宛如随性的生活插画或情绪素描，留白充裕，背景极简，居家细节低调，营造出一种平静、困倦且情感耗竭的氛围。',
    voteCount: 0,
    createdAt: '2026-11-08T09:30:56.742Z',
  },
  {
    id: 'visual-03',
    title: '女孩动漫插画街头可爱',
    category: 'visual',
    cover: 'visual-03.webp',
    tool: 'GPT Image',
    prompt: '{"type":"信息密集型动漫街头服饰角色海报","style":"高细节日本动漫插画与醒目的平面设计排版相结合，赛博贴纸布局，黑白与粉蓝色调，清晰的矢量 UI 元素，光面杂志海报质感","main_subject":{"character":"俏皮可爱的故障天使女孩","pose":"全身漂浮动态姿势，膝盖弯曲，一只靴子向前，双手在脸旁比出剪刀手，单眼眨眼并吐舌头","appearance":{"hair":"{argument name=\\"hair color\\" default=\\"短款浅蓝色波波头，配直刘海\\"}","eyes":"一只红眼睁开，另一只眼眨眼","features":"长尖精灵耳，头顶上方倾斜的小白光环，小白天使翅膀，俏皮的微笑，细小的赛博面部标记和发夹"},"outfit":{"count":6,"items":["超大号天蓝色飞行员夹克，饰有白云图案、补丁、拉链头和垂坠带子","白色短款图形上衣，配黑色系带细节","黑色百褶迷你裙，配腰带和链条","蓝色多功能腰带和带有小标签的腰包","厚底蓝白系带机能风街头靴","蓝色吊带、绷带风格腿部贴片以及悬挂的兔子挂件饰品"]}},"layout":{"canvas":"方形海报，居中角色叠加在密集的编辑背景上","background":"黑白分割的赛博网格构图，包含粗色块、细技术线条、半调条纹、条形码图案、箭头、框架、圆点、星星和 UI 方框","main_text":{"headline":"{argument name=\\"headline text\\" default=\\"HEAVEN ERROR\\"}","number":"{argument name=\\"error number\\" default=\\"777\\"}","placement":"左侧和顶部巨大的粗体压缩黑色标题，角色身后巨大的淡蓝色数字"},"visible_text_elements":{"count":13,"labels":["ANGEL GLITCH","HEAVEN ERROR","777","HEAVEN ERROR ANGEL GLITCH","KEEP OUT","CODE : 777 STATUS : ANGEL GLITCH AREA : HEAVEN\'S ERROR","GLITCH MODE","ERROR 777","ANGEL GLITCH SYSTEM","OVERLOAD HEAVEN PROTOCOL ERROR","ERROR 777","ANGEL GLITCH SYSTEM ERROR CODE 777","HEAVEN ERROR"]},"graphic_icons":{"count":7,"items":["左上角 ANGEL GLITCH 附近的黑色心形图标","方框内带有 KEEP OUT 的大箭头图标","左侧信息面板上的圆形地球仪图标","右上角带有黑色十字的蓝色心形","中右侧蓝色边框的兔脸图标","左下角面板上的小型蓝心十字错误徽章","底部中心附近的蓝色线框地球仪图标"]},"panels_and_ui_components":{"count":10,"items":["左上角带有心形和 ANGEL GLITCH 的品牌条","右上角带有 KEEP OUT 和 ERROR 777 的黑色警告条","巨大数字下方的左侧数据块，包含标题和星星","左侧方形箭头 KEEP OUT 标志","左下角 GLITCH MODE 条形码框","左下角 ERROR 777 徽章","右侧垂直 ANGEL GLITCH SYSTEM ERROR CODE 777 条","中右侧兔子图标扫描框","底部中心 ANGEL GLITCH SYSTEM 标签和空白技术矩形","右下角过载协议错误标签和条纹块"]}},"color_palette":{"primary":"{argument name=\\"primary accent color\\" default=\\"粉蓝色\\"}","secondary":"黑白","accents":"细小的红眼和细微的贴纸细节"},"rendering_instructions":"使用锐利清晰的线条，高度精细的动漫阴影，细致的织物褶皱，光泽高光，清晰易读的粗体排版，分层印刷海报构图，非写实风格，无模糊文字，无多余角色。"}',
    voteCount: 0,
    createdAt: '2026-11-08T09:26:05.058Z',
  },
  {
    id: 'visual-02',
    title: '人像插画矢量冷调街头忧郁',
    category: 'visual',
    cover: 'visual-02.webp',
    tool: 'Qwen-image2.1',
    prompt: `主体与构图：一张风格化的低角度肖像，主角是年轻男子，神情宁静地向上仰望。他戴着一副大型头戴式耳机，头上戴着一顶有质感的红色冷帽。构图为特写镜头，聚焦于侧脸和颈部，采用电影级视角拍摄。
艺术风格：融合了现代波普艺术与数字矢量插画。图像运用了大胆的高对比度阴影和干净的线条。
阴影采用“赛璐珞”或海报风格渲染，呈现出明显的色块，而非平滑的渐变。
色彩搭配：引人注目的有限配色方案，包括深黑色、柔和的灰色、鲜艳的红色，以及特定的青色/薄荷绿点缀色。背景为平坦的中性灰白色，带有微妙、纤细的几何草图线条。
细节与质感：人物的夹克和冷帽上带有红色和青色的表现主义笔触。耳机具有光泽的金属质感，并带有逼真的反射效果。皮肤以灰色调和青色高光渲染，以强调来自上方的戏剧性光影。
氛围：都市、艺术且略带忧郁，让人联想到高端图像小说封面或现代街头艺术壁画。`,
    voteCount: 0,
    createdAt: '2026-11-08T09:19:51.998Z',
  },
  {
    id: 'visual-01',
    title: '暗黑武士海报',
    category: 'visual',
    cover: 'visual-01.webp',
    tool: 'Qwen-image2.1',
    prompt: `暗黑武士海报艺术，采用水墨与喷溅画风格，竖版构图，黑、白、红高对比度配色方案。

中心主体：身着飘逸白色和服、头戴宽大斗笠的浪人武士剪影，面部隐于阴影中，手持两把散发红光的武士刀。人物姿态动感十足，带有风动效果。             
   
背景：巨大的红色圆形太阳或印章，中心带有抽象的黑色笔触符号。背景辅以强烈的黑白墨迹喷溅、笔触以及红色颜料泼洒，营造出粗犷而强烈的氛围。

文本元素采用现代无衬线字体及做旧字体：
- 左侧竖排：大号红色字母“RONIN”，下方为小号白色字母“WANDER”，底部带有红色印章
- 左下角：醒目的大号笔触文字“RONIN”，下方配有较小的红色文字“RONIN”
- 右上角：竖排列表，词汇“HONOR”、“LOYALTY”、“SPIRIT”前各带一个红点
- 右侧竖排：顶部为“THE SILENT PATH”，底部为“NO DESTINATION ONLY PURPOSE”
- 左下角：文字“JAPAN”及条形码图形

风格：赛博朋克与传统日本艺术的融合，戏剧性光影，粗犷质感，平面设计海报美学，边缘锐利，墨迹喷溅效果，2:3 竖版比例。`,
    voteCount: 0,
    createdAt: '2026-11-08T09:17:32.772Z',
  },
  {
    id: 'text-01',
    title: '雾都来信',
    category: 'text',
    cover: 'text-01.webp',
    coverAspect: 'portrait',
    description: '一封写给十八岁自己的信，写了雾、操场和一次考砸的试。',
    body: `十八岁的我：

见字如面。

你现在大概正坐在渝北某间教室里，把书包塞在桌肚最里面，偷偷数还有多久放学。窗外是重庆那种不讲道理的雾，把对岸的楼只留下一个轮廓，像谁用橡皮擦轻轻擦过一遍。

我想告诉你三件事。

第一，你会考砸一次很重要的试，然后发现天没有塌。那天你会在操场走到九点半，风很大，哭得很狼狈，但第二天你还是去上课了。这件事你以后会记很久——不是因为难过，是因为你居然自己撑过来了。

第二，你会在图书馆四楼靠窗的位置遇到一个人。你们没有在一起，但你会因为他开始写东西。这件事不亏。

第三，也是最重要的：你会慢慢喜欢上这座城市。不是因为它漂亮——它常常很吵、很挤、楼梯多得要命——而是因为它认得努力的样子。重庆的坡从来不替你省力，但它也从来不笑你走得慢。

最后一句，是我二十六岁才学会的：

别急着长成大人。雾会散的，散了你就能看见江。

—— 二十六岁的你`,
    tool: 'DeepSeek-V3.2',
    prompt: '帮我写一封「写给十八岁的自己」的信。要有重庆的雾，要具体到某个下午，不要写成鸡汤。',
    creator: '匿名社员',
    voteCount: 0,
    createdAt: '2026-11-06T21:14:00+08:00',
  },
  {
    id: 'text-02',
    title: '把重庆的夏天切成十二段',
    category: 'text',
    cover: 'text-02.webp',
    coverAspect: 'portrait',
    description: '十二个一分钟的夏天切片，给南方的热写一份档案。',
    body: `01 早上的第一口空气是甜的，因为空调外机还没开始工作。
02 轻轨进站时带起一阵热风，像有人在你背后叹了口气。
03 冰柜玻璃上凝着水汽，老板用袖子一抹，露出三排橘子汽水。
04 树荫是夏天的房产，谁先占到谁赢。
05 有人在操场上跑了三圈，说要把脂肪交给太阳。
06 下午两点的教室，吊扇转得像在敷衍。
07 雪糕化得比心跳还快。
08 天台的风和楼下完全是两种东西。
09 暴雨来临前，整座城市都在等一个喷嚏。
10 雨停之后，马路上蒸起一层白，像城市自己呼了一口气。
11 夜晚的烧烤摊，辣椒面和蝉鸣一起响。
12 凌晨一点，你终于舍得关掉风扇，然后立刻又打开。`,
    tool: 'DeepSeek-V3.2',
    prompt: '用十二个片段写重庆的夏天，每段一句，要具体、有温度，全程不许出现「炎热」两个字。',
    creator: '匿名社员',
    voteCount: 0,
    createdAt: '2026-11-07T15:02:00+08:00',
  },
  {
    id: 'text-03',
    title: '闭馆音乐之后',
    category: 'text',
    cover: 'text-03.webp',
    coverAspect: 'portrait',
    description: '图书馆闭馆前的十分钟，是一天里最像电影的时刻。',
    body: `闭馆音乐响起的时候，没有人立刻走。

这是一种默契：谁都知道时间到了，但谁都想把这一页看完。

四楼靠窗的男生合上书，把笔帽扣上，坐了三十秒才站起来。他的杯子早空了，可他还是拿起来喝了一口——像在确认今天真的结束了。

电梯口排着队。有人边等边刷手机，有人盯着楼层数字发呆，有人小声跟旁边的人说「明天早点来占位」。

我总觉得这十分钟很贵。它不够长，长不到让你焦虑；又不够短，短不到让你无感。它刚好够一个人把今天收好，再慢慢走出去。

八号门外的桂花开了。风一吹，味道就跟着人流散开。

明天见。`,
    tool: 'DeepSeek-V3.2',
    prompt: '写大学图书馆闭馆前十分钟的场景，只用细节推动，不要出现任何角色名字。',
    creator: '匿名社员',
    voteCount: 0,
    createdAt: '2026-11-07T22:40:00+08:00',
  },
  {
    id: 'music-04',
    title: 'Bittersweet Momentum',
    category: 'music',
    cover: 'music-04.webp',
    coverAspect: 'square',
    description: '吉他前奏一响，人就往前冲。写的是「明知道会结束，还是想跑过去」的那股劲。',
    audioUrl: 'music-04.mp3',
    duration: 223,
    tool: 'Suno',
    prompt: `Catchy alternative rock with energetic pop-rock drive and dreamy indie-rock color. Open immediately on a distinctive, instantly memorable overdriven electric-guitar riff; bring in punchy live kick and snare with bright cymbal crashes, then a melodic bass line and layered crunchy rhythm guitars. Build through dynamic breakdowns into a huge, uplifting instrumental chorus led by soaring guitar melodies, expressive bends, emotional slides, sustained high notes, and wide stereo delay with atmospheric reverb. Bring back the central riff between sections, add lively drum fills, and peak in a final layered lead-guitar solo before a bittersweet, spacious atmospheric outro. Polished modern production with organic live-band energy, bold dynamics, youthful rebellious emotion, and forward momentum.`,
    creator: '匿名社员',
    voteCount: 0,
    createdAt: '2026-11-08T21:58:06+08:00',
  },
  {
    id: 'music-05',
    title: 'Bittersweet Momentum (II)',
    category: 'music',
    cover: 'music-05.webp',
    coverAspect: 'square',
    description: '同一首歌的另一个版本：更重的鼓、更大的副歌，结尾留了一句没弹完的旋律。',
    audioUrl: 'music-05.mp3',
    duration: 213,
    tool: 'Suno',
    prompt: `Catchy alternative rock with energetic pop-rock drive and dreamy indie-rock color. Open immediately on a distinctive, instantly memorable overdriven electric-guitar riff; bring in punchy live kick and snare with bright cymbal crashes, then a melodic bass line and layered crunchy rhythm guitars. Build through dynamic breakdowns into a huge, uplifting instrumental chorus led by soaring guitar melodies, expressive bends, emotional slides, sustained high notes, and wide stereo delay with atmospheric reverb. Bring back the central riff between sections, add lively drum fills, and peak in a final layered lead-guitar solo before a bittersweet, spacious atmospheric outro. Polished modern production with organic live-band energy, bold dynamics, youthful rebellious emotion, and forward momentum.`,
    creator: '匿名社员',
    voteCount: 0,
    createdAt: '2026-11-08T21:57:55+08:00',
  },
  {
    id: 'music-06',
    title: 'Lingering Delay',
    category: 'music',
    cover: 'music-06.webp',
    coverAspect: 'square',
    description: '慢下来的那一首。延迟、混响、窗帘后面的光，都在说同一件事：有些东西会一直跟着你。',
    audioUrl: 'music-06.mp3',
    duration: 178,
    tool: 'Suno',
    prompt: `Dreamy emotional indie rock with dream-pop and atmospheric shoegaze textures. A slow, spacious clean electric guitar introduction carries a memorable lyrical melody with expressive bends, sliding phrases, delicate vibrato, and soaring sustained high notes; crystal-clear tone with lush stereo delay, spacious reverb, and subtle chorus. Gradually bring in warm melodic electric bass, restrained organic live acoustic drums, ambient keyboards, and layered shimmering guitars. Increase rhythmic drive and guitar density section by section into an intense cathartic climax with powerful drums and atmospheric distorted guitar layers, then gradually strip back to a quiet spacious guitar outro with lingering delay and reverb fading gently. Dynamic arrangement, melancholic yet liberating, bittersweet, nostalgic, youthful, introspective, cinematic; sophisticated harmony, organic band performance, polished immersive studio mix.`,
    creator: '匿名社员',
    voteCount: 0,
    createdAt: '2026-11-08T22:05:01+08:00',
  },
  {
    id: 'music-07',
    title: 'Lingering Delay (II)',
    category: 'music',
    cover: 'music-07.webp',
    coverAspect: 'square',
    description: '同一首歌的另一个版本：更安静的开头，更长的尾音，像雨停在玻璃上。',
    audioUrl: 'music-07.mp3',
    duration: 172,
    tool: 'Suno',
    prompt: `Dreamy emotional indie rock with dream-pop and atmospheric shoegaze textures. A slow, spacious clean electric guitar introduction carries a memorable lyrical melody with expressive bends, sliding phrases, delicate vibrato, and soaring sustained high notes; crystal-clear tone with lush stereo delay, spacious reverb, and subtle chorus. Gradually bring in warm melodic electric bass, restrained organic live acoustic drums, ambient keyboards, and layered shimmering guitars. Increase rhythmic drive and guitar density section by section into an intense cathartic climax with powerful drums and atmospheric distorted guitar layers, then gradually strip back to a quiet spacious guitar outro with lingering delay and reverb fading gently. Dynamic arrangement, melancholic yet liberating, bittersweet, nostalgic, youthful, introspective, cinematic; sophisticated harmony, organic band performance, polished immersive studio mix.`,
    creator: '匿名社员',
    voteCount: 0,
    createdAt: '2026-11-08T22:05:10+08:00',
  },
  {
    id: 'music-08',
    title: 'Sunset By The Sea',
    category: 'music',
    coverAspect: 'square',
    description: '温柔治愈的室内乐：钢琴、大提琴与长笛，像海边黄昏慢慢安静下来，最后只剩一架钢琴。',
    audioUrl: 'music-08.mp3',
    duration: 218,
    tool: 'Suno',
    prompt: `Gentle healing instrumental chamber piece, around 80 BPM. Warm piano lead with delicate touch and sustained pedal; long, mellow cello and viola harmony pads in the low-mid register. Breath-like flute phrases between piano lines, sparse high-register harp and celesta flecks. Barely audible brushed percussion and soft shaker. Restrained arrangement with generous space, broad soft reverb, warm open sunset-by-the-sea atmosphere, never bright or harsh. Gradually thin the arrangement so the ending is solo piano fading away.`,
    creator: '匿名社员',
    voteCount: 0,
    createdAt: '2026-11-09T01:15:24+08:00',
  },
  {
    id: 'idea-01',
    title: '给山城装一部会认人的电梯',
    category: 'idea',
    cover: 'idea-01.webp',
    coverAspect: 'portrait',
    description: '一个不太可行但很想要的提案：电梯认得你，也认得你手里拎的菜。',
    body: `提案名称：会认人的电梯（暂定名「梯梯」）

问题
山城的楼有十七种入口。快递小哥每天在同一栋楼里爬三个来回；老人拎着菜站在梯坎下喘气；电梯明明就在里面，可它有时候不在你这一层。

想法
电梯门口装一个「认人」的摄像头（只做本地识别，不上传）。它记得三件事：你的脸、你常去的楼层、你手里拎着什么。

- 你走近，它提前下来，门开着等你。
- 你拎着两袋菜，它自动多停三秒。
- 你抱着孩子，它报站的声音会小一点。
- 外卖员第一次来，它只说一句「左边第三个门」；第二次它就记住了。

争议
隐私。所以它不存画面，只存一串谁也对不起号的「习惯编号」，而且门口有一个能一键关掉它的开关。

结论
这是一个很小的关怀，但它每天都在发生。好的城市设计大概就是：让你每天少爬一层楼。`,
    tool: 'DeepSeek-V3.2',
    prompt: '给我三个能让山城居民每天少费力一点的小发明，要具体到能画出来，不要宏大叙事。',
    creator: '匿名社员',
    voteCount: 0,
    createdAt: '2026-11-05T20:05:00+08:00',
  },
  {
    id: 'idea-02',
    title: '食堂窗口的 AI 点歌机',
    category: 'idea',
    cover: 'idea-02.webp',
    coverAspect: 'portrait',
    description: '每个窗口配一首主题曲，跟着阿姨的铲子一起响。',
    body: `灵感来自食堂阿姨的手速——她们打菜是有节奏的。

所以这个提案很不严肃：给每个窗口配一首 30 秒主题曲，由 AI 根据当天菜色生成，循环播放。

- 麻辣香锅窗口：偏摇滚，鼓点密，跟着铲子走；
- 汤粉窗口：慢一点，像雨天的纯音乐；
- 面食窗口：手风琴，暖；
- 素菜窗口：轻轻的风声加钢琴，别让人有压力。

规则只有一条：音量不能超过「说话能听清」。

想象一下：中午十二点，你排着队，忽然听见今天的青椒肉丝有了一段自己的前奏。

会不会有点好笑？会的。但那可能是你今天唯一觉得食堂可爱的时刻。`,
    tool: 'DeepSeek-V3.2',
    prompt: '给食堂每个窗口写一首 30 秒主题曲的创意，要具体到曲风、乐器、播放规则。',
    creator: '匿名社员',
    voteCount: 0,
    createdAt: '2026-11-06T12:30:00+08:00',
  },
  {
    id: 'idea-03',
    title: '把重庆的雾做成可下载的壁纸',
    category: 'idea',
    cover: 'idea-03.webp',
    coverAspect: 'portrait',
    description: '如果雾可以被装进一个 3MB 的文件，它会是什么样子？',
    body: `提案：雾的可下载化。

重庆的雾是一种公共资源，但没人能带走它。所以我想做一件事：把不同天气、不同时段、不同江段的雾，做成可以下载的桌面壁纸。

不是拍一张雾的照片，而是让它「会动」：

- 早上七点的雾是慢的，像还没醒；
- 中午的雾被太阳撕开一条缝，缝里是桥；
- 夜里的雾是橙色的，因为下面是灯火。

技术上不复杂：用 AI 生成三层雾的视差图层，叠在一起轻微移动，导出成 10 秒循环视频，压到 3MB 以内。

使用场景：
你在外地实习，想重庆了就打开它。屏幕里的雾在动，你会觉得这座城市还在呼吸。

也许它不值钱，但它让「想念」有了一个具体的形状。`,
    tool: 'DeepSeek-V3.2',
    prompt: '想一个能把重庆的雾带给不在重庆的人的产品，要技术上可行、能做成文件。',
    creator: '匿名社员',
    voteCount: 0,
    createdAt: '2026-11-07T09:45:00+08:00',
  },
]
