// MEAL LOGGER — Indian Veg Food Database
// ═══════════════════════════════════════════════════════════════════
// Each entry: {name, cal, protein, carbs, fat} per 1 serving/unit
// cal=kcal, protein/carbs/fat=grams
const FOOD_DB = [
  // ═══ VEGETARIAN ═══
  // ── Breads & Rotis ──────────────────────────────
  {name:'Roti (wheat)',            veg:1, cal:71,  pro:2.7, carb:15,  fat:0.4, unit:'piece'},
  {name:'Phulka',                  veg:1, cal:55,  pro:2.0, carb:12,  fat:0.3, unit:'piece'},
  {name:'Paratha (plain)',         veg:1, cal:126, pro:3.1, carb:18,  fat:4.8, unit:'piece'},
  {name:'Aloo Paratha',            veg:1, cal:200, pro:4.5, carb:30,  fat:7.0, unit:'piece'},
  {name:'Gobhi Paratha',           veg:1, cal:185, pro:4.0, carb:27,  fat:6.5, unit:'piece'},
  {name:'Mooli Paratha',           veg:1, cal:170, pro:3.8, carb:25,  fat:6.0, unit:'piece'},
  {name:'Paneer Paratha',          veg:1, cal:220, pro:9.0, carb:28,  fat:8.5, unit:'piece'},
  {name:'Methi Paratha',           veg:1, cal:155, pro:4.0, carb:22,  fat:5.5, unit:'piece'},
  {name:'Puri',                    veg:1, cal:112, pro:2.2, carb:14,  fat:5.5, unit:'piece'},
  {name:'Naan (plain)',            veg:1, cal:262, pro:8.7, carb:46,  fat:5.1, unit:'piece'},
  {name:'Butter Naan',             veg:1, cal:300, pro:8.0, carb:46,  fat:9.0, unit:'piece'},
  {name:'Garlic Naan',             veg:1, cal:280, pro:8.0, carb:46,  fat:7.5, unit:'piece'},
  {name:'Bhatura',                 veg:1, cal:245, pro:6.0, carb:38,  fat:8.5, unit:'piece'},
  {name:'Missi Roti',              veg:1, cal:95,  pro:4.5, carb:16,  fat:2.0, unit:'piece'},
  {name:'Bajra Roti',              veg:1, cal:75,  pro:2.5, carb:15,  fat:1.0, unit:'piece'},
  {name:'Jowar Roti',              veg:1, cal:70,  pro:2.4, carb:14,  fat:0.8, unit:'piece'},
  {name:'Makki ki Roti',           veg:1, cal:80,  pro:2.0, carb:16,  fat:1.5, unit:'piece'},
  {name:'Thalipeeth',              veg:1, cal:165, pro:6.0, carb:28,  fat:3.5, unit:'piece'},
  {name:'Bread (white)',           veg:1, cal:67,  pro:2.5, carb:13,  fat:0.9, unit:'slice'},
  {name:'Bread (brown)',           veg:1, cal:60,  pro:3.0, carb:11,  fat:0.8, unit:'slice'},
  {name:'Bread (multigrain)',      veg:1, cal:55,  pro:3.2, carb:10,  fat:0.9, unit:'slice'},
  // ── South Indian ────────────────────────────────
  {name:'Idli',                    veg:1, cal:39,  pro:2.0, carb:7.5, fat:0.2, unit:'piece'},
  {name:'Rava Idli',               veg:1, cal:85,  pro:3.0, carb:15,  fat:1.5, unit:'piece'},
  {name:'Dosa (plain)',            veg:1, cal:133, pro:3.5, carb:25,  fat:2.1, unit:'piece'},
  {name:'Masala Dosa',             veg:1, cal:206, pro:5.0, carb:35,  fat:6.0, unit:'piece'},
  {name:'Rava Dosa',               veg:1, cal:155, pro:3.5, carb:28,  fat:4.0, unit:'piece'},
  {name:'Set Dosa',                veg:1, cal:120, pro:3.5, carb:22,  fat:2.5, unit:'piece'},
  {name:'Uttapam',                 veg:1, cal:118, pro:4.0, carb:22,  fat:2.0, unit:'piece'},
  {name:'Medu Vada',               veg:1, cal:112, pro:4.0, carb:15,  fat:4.5, unit:'piece'},
  {name:'Pongal',                  veg:1, cal:165, pro:5.0, carb:30,  fat:3.5, unit:'bowl'},
  {name:'Pesarattu',               veg:1, cal:95,  pro:5.5, carb:15,  fat:2.0, unit:'piece'},
  {name:'Appam',                   veg:1, cal:90,  pro:2.5, carb:18,  fat:1.5, unit:'piece'},
  {name:'Puttu',                   veg:1, cal:120, pro:3.0, carb:24,  fat:1.0, unit:'serving'},
  {name:'Idiyappam',               veg:1, cal:130, pro:2.5, carb:28,  fat:0.5, unit:'serving'},
  {name:'Avial',                   veg:1, cal:115, pro:3.0, carb:14,  fat:5.5, unit:'bowl'},
  {name:'Kootu',                   veg:1, cal:130, pro:5.0, carb:18,  fat:4.0, unit:'bowl'},
  {name:'Thoran',                  veg:1, cal:110, pro:3.5, carb:12,  fat:5.5, unit:'bowl'},
  {name:'Sambar',                  veg:1, cal:100, pro:5.5, carb:16,  fat:2.0, unit:'bowl'},
  {name:'Rasam',                   veg:1, cal:60,  pro:2.0, carb:10,  fat:1.5, unit:'bowl'},
  {name:'Bisi Bele Bath',          veg:1, cal:210, pro:8.0, carb:35,  fat:5.0, unit:'bowl'},
  {name:'Curd Rice',               veg:1, cal:185, pro:6.0, carb:32,  fat:3.5, unit:'bowl'},
  {name:'Tamarind Rice',           veg:1, cal:200, pro:4.0, carb:38,  fat:4.5, unit:'bowl'},
  {name:'Lemon Rice',              veg:1, cal:185, pro:3.5, carb:36,  fat:3.5, unit:'bowl'},
  {name:'Coconut Rice',            veg:1, cal:220, pro:3.5, carb:38,  fat:6.0, unit:'bowl'},
  // ── Breakfast & Tiffin ──────────────────────────
  {name:'Poha',                    veg:1, cal:180, pro:3.5, carb:35,  fat:3.0, unit:'bowl'},
  {name:'Upma',                    veg:1, cal:195, pro:4.5, carb:33,  fat:5.5, unit:'bowl'},
  {name:'Vermicelli Upma',         veg:1, cal:210, pro:5.0, carb:38,  fat:4.5, unit:'bowl'},
  {name:'Sabudana Khichdi',        veg:1, cal:280, pro:3.0, carb:55,  fat:5.5, unit:'bowl'},
  {name:'Besan Chilla',            veg:1, cal:135, pro:8.0, carb:17,  fat:3.5, unit:'piece'},
  {name:'Moong Dal Chilla',        veg:1, cal:120, pro:9.0, carb:16,  fat:2.5, unit:'piece'},
  {name:'Oats (cooked)',           veg:1, cal:150, pro:5.0, carb:27,  fat:2.5, unit:'bowl'},
  {name:'Daliya (broken wheat)',   veg:1, cal:160, pro:5.5, carb:30,  fat:1.5, unit:'bowl'},
  {name:'Cornflakes with milk',    veg:1, cal:190, pro:7.0, carb:36,  fat:2.5, unit:'bowl'},
  {name:'Muesli with milk',        veg:1, cal:240, pro:8.0, carb:42,  fat:5.0, unit:'bowl'},
  {name:'Granola',                 veg:1, cal:220, pro:5.0, carb:38,  fat:6.0, unit:'serving'},
  {name:'Greek Yogurt (plain)',    veg:1, cal:100, pro:17,  carb:6,   fat:0.7, unit:'cup'},
  // ── Rice Dishes ─────────────────────────────────
  {name:'Rice (steamed)',          veg:1, cal:130, pro:2.7, carb:28,  fat:0.3, unit:'cup'},
  {name:'Brown Rice',              veg:1, cal:115, pro:2.5, carb:24,  fat:0.9, unit:'cup'},
  {name:'Jeera Rice',              veg:1, cal:150, pro:3.0, carb:30,  fat:2.5, unit:'cup'},
  {name:'Veg Biryani',             veg:1, cal:290, pro:7.0, carb:52,  fat:6.5, unit:'plate'},
  {name:'Veg Pulao',               veg:1, cal:210, pro:5.0, carb:40,  fat:3.5, unit:'cup'},
  {name:'Khichdi',                 veg:1, cal:180, pro:7.5, carb:33,  fat:2.5, unit:'bowl'},
  {name:'Tomato Rice',             veg:1, cal:175, pro:3.5, carb:34,  fat:3.5, unit:'bowl'},
  // ── Dals & Lentils ──────────────────────────────
  {name:'Dal Tadka',               veg:1, cal:115, pro:7.5, carb:18,  fat:2.5, unit:'bowl'},
  {name:'Dal Fry',                 veg:1, cal:125, pro:7.0, carb:19,  fat:3.5, unit:'bowl'},
  {name:'Dal Makhani',             veg:1, cal:185, pro:9.0, carb:22,  fat:6.5, unit:'bowl'},
  {name:'Chana Dal',               veg:1, cal:160, pro:9.5, carb:24,  fat:2.5, unit:'bowl'},
  {name:'Moong Dal',               veg:1, cal:105, pro:7.0, carb:17,  fat:0.5, unit:'bowl'},
  {name:'Masoor Dal',              veg:1, cal:120, pro:9.0, carb:18,  fat:0.8, unit:'bowl'},
  {name:'Urad Dal',                veg:1, cal:140, pro:9.5, carb:20,  fat:1.5, unit:'bowl'},
  {name:'Toor Dal',                veg:1, cal:115, pro:7.0, carb:19,  fat:1.0, unit:'bowl'},
  {name:'Panchmel Dal',            veg:1, cal:160, pro:10,  carb:24,  fat:3.0, unit:'bowl'},
  {name:'Rajma',                   veg:1, cal:215, pro:13,  carb:35,  fat:1.5, unit:'bowl'},
  {name:'Chole (Chana Masala)',    veg:1, cal:270, pro:14,  carb:42,  fat:6.0, unit:'bowl'},
  {name:'Kadhi (plain)',           veg:1, cal:150, pro:5.0, carb:18,  fat:6.0, unit:'bowl'},
  {name:'Kadhi Pakoda',            veg:1, cal:220, pro:7.5, carb:24,  fat:10,  unit:'bowl'},
  {name:'Lobhia (black eyed peas)',veg:1, cal:190, pro:11,  carb:30,  fat:2.0, unit:'bowl'},
  {name:'Chhole Saag',             veg:1, cal:230, pro:12,  carb:35,  fat:6.0, unit:'bowl'},
  // ── Paneer ──────────────────────────────────────
  {name:'Paneer (raw)',            veg:1, cal:265, pro:18,  carb:3,   fat:20,  unit:'100g'},
  {name:'Paneer Butter Masala',    veg:1, cal:290, pro:14,  carb:12,  fat:21,  unit:'bowl'},
  {name:'Palak Paneer',            veg:1, cal:260, pro:15,  carb:10,  fat:18,  unit:'bowl'},
  {name:'Shahi Paneer',            veg:1, cal:310, pro:14,  carb:14,  fat:23,  unit:'bowl'},
  {name:'Paneer Bhurji',           veg:1, cal:240, pro:15,  carb:7,   fat:17,  unit:'bowl'},
  {name:'Matar Paneer',            veg:1, cal:245, pro:13,  carb:16,  fat:15,  unit:'bowl'},
  {name:'Paneer Tikka',            veg:1, cal:260, pro:18,  carb:8,   fat:17,  unit:'serving'},
  {name:'Kadai Paneer',            veg:1, cal:275, pro:14,  carb:11,  fat:20,  unit:'bowl'},
  {name:'Paneer Do Pyaza',         veg:1, cal:265, pro:14,  carb:12,  fat:19,  unit:'bowl'},
  // ── Vegetables ──────────────────────────────────
  {name:'Aloo Gobi',               veg:1, cal:130, pro:3.5, carb:20,  fat:4.5, unit:'bowl'},
  {name:'Baingan Bharta',          veg:1, cal:100, pro:3.0, carb:14,  fat:4.0, unit:'bowl'},
  {name:'Bhindi Masala',           veg:1, cal:115, pro:3.0, carb:12,  fat:6.0, unit:'bowl'},
  {name:'Mix Veg Sabzi',           veg:1, cal:120, pro:4.0, carb:16,  fat:4.5, unit:'bowl'},
  {name:'Aloo Jeera',              veg:1, cal:165, pro:3.0, carb:28,  fat:5.0, unit:'bowl'},
  {name:'Aloo Matar',              veg:1, cal:155, pro:5.5, carb:24,  fat:4.5, unit:'bowl'},
  {name:'Matar Mushroom',          veg:1, cal:140, pro:6.0, carb:18,  fat:5.0, unit:'bowl'},
  {name:'Lauki Sabzi',             veg:1, cal:75,  pro:2.5, carb:12,  fat:2.5, unit:'bowl'},
  {name:'Tinda Sabzi',             veg:1, cal:70,  pro:2.0, carb:11,  fat:2.5, unit:'bowl'},
  {name:'Methi Sabzi',             veg:1, cal:90,  pro:4.0, carb:13,  fat:2.5, unit:'bowl'},
  {name:'Sarson da Saag',          veg:1, cal:140, pro:6.5, carb:15,  fat:6.0, unit:'bowl'},
  {name:'Palak Sabzi',             veg:1, cal:85,  pro:5.0, carb:10,  fat:3.0, unit:'bowl'},
  {name:'Arbi Sabzi',              veg:1, cal:150, pro:3.0, carb:25,  fat:4.5, unit:'bowl'},
  {name:'Karela Sabzi',            veg:1, cal:80,  pro:2.5, carb:10,  fat:3.5, unit:'bowl'},
  {name:'Capsicum Masala',         veg:1, cal:100, pro:2.5, carb:12,  fat:5.0, unit:'bowl'},
  {name:'Pav Bhaji',               veg:1, cal:290, pro:7.0, carb:42,  fat:10,  unit:'plate'},
  {name:'Undhiyu',                 veg:1, cal:210, pro:7.0, carb:28,  fat:8.0, unit:'bowl'},
  {name:'Mushroom Masala',         veg:1, cal:145, pro:5.5, carb:14,  fat:8.0, unit:'bowl'},
  {name:'Jackfruit Sabzi',         veg:1, cal:120, pro:3.5, carb:20,  fat:3.5, unit:'bowl'},
  {name:'Soya Chunks Curry',       veg:1, cal:210, pro:20,  carb:18,  fat:5.0, unit:'bowl'},
  {name:'Tofu Bhurji',             veg:1, cal:145, pro:12,  carb:5,   fat:8.5, unit:'bowl'},
  // ── Snacks & Street Food ────────────────────────
  {name:'Samosa',                  veg:1, cal:130, pro:2.5, carb:18,  fat:6.0, unit:'piece'},
  {name:'Kachori',                 veg:1, cal:160, pro:4.0, carb:20,  fat:7.5, unit:'piece'},
  {name:'Vada',                    veg:1, cal:98,  pro:3.5, carb:13,  fat:4.0, unit:'piece'},
  {name:'Dhokla',                  veg:1, cal:76,  pro:5.0, carb:12,  fat:1.0, unit:'piece'},
  {name:'Khandvi',                 veg:1, cal:80,  pro:4.5, carb:10,  fat:2.5, unit:'serving'},
  {name:'Pakoda (mix veg)',        veg:1, cal:90,  pro:2.5, carb:11,  fat:4.5, unit:'piece'},
  {name:'Mirchi Bajji',            veg:1, cal:110, pro:2.5, carb:14,  fat:5.0, unit:'piece'},
  {name:'Chaat (papdi)',           veg:1, cal:180, pro:4.5, carb:28,  fat:6.0, unit:'serving'},
  {name:'Pani Puri',               veg:1, cal:42,  pro:1.0, carb:8.0, fat:1.0, unit:'piece'},
  {name:'Bhel Puri',               veg:1, cal:180, pro:5.0, carb:32,  fat:4.0, unit:'serving'},
  {name:'Dahi Vada',               veg:1, cal:210, pro:9.0, carb:30,  fat:6.0, unit:'serving'},
  {name:'Aloo Tikki',              veg:1, cal:130, pro:3.0, carb:22,  fat:4.0, unit:'piece'},
  {name:'Bread Pakoda',            veg:1, cal:168, pro:4.5, carb:22,  fat:7.0, unit:'piece'},
  {name:'Vada Pav',                veg:1, cal:280, pro:7.0, carb:40,  fat:9.5, unit:'piece'},
  {name:'Misal Pav',               veg:1, cal:320, pro:12,  carb:48,  fat:9.0, unit:'plate'},
  {name:'Pav Bhaji',               veg:1, cal:290, pro:7.0, carb:42,  fat:10,  unit:'plate'},
  {name:'Sev Puri',                veg:1, cal:165, pro:3.5, carb:26,  fat:5.5, unit:'serving'},
  {name:'Dahi Puri',               veg:1, cal:190, pro:5.0, carb:30,  fat:5.5, unit:'serving'},
  {name:'Corn Chaat',              veg:1, cal:150, pro:4.0, carb:28,  fat:3.5, unit:'bowl'},
  {name:'Peanut Chaat',            veg:1, cal:190, pro:8.0, carb:16,  fat:11,  unit:'bowl'},
  {name:'Momos (veg, steamed)',    veg:1, cal:160, pro:5.5, carb:28,  fat:2.5, unit:'serving'},
  {name:'Momos (veg, fried)',      veg:1, cal:230, pro:5.5, carb:28,  fat:10,  unit:'serving'},
  {name:'Spring Roll (veg)',       veg:1, cal:115, pro:2.5, carb:15,  fat:5.0, unit:'piece'},
  // ── Dairy & Beverages ───────────────────────────
  {name:'Curd / Dahi',             veg:1, cal:98,  pro:11,  carb:7,   fat:3.5, unit:'bowl'},
  {name:'Raita',                   veg:1, cal:75,  pro:4.5, carb:8,   fat:2.5, unit:'bowl'},
  {name:'Lassi (sweet)',           veg:1, cal:155, pro:5.0, carb:25,  fat:4.5, unit:'glass'},
  {name:'Lassi (salted)',          veg:1, cal:105, pro:5.0, carb:12,  fat:4.0, unit:'glass'},
  {name:'Chaas / Buttermilk',      veg:1, cal:40,  pro:3.0, carb:5,   fat:1.0, unit:'glass'},
  {name:'Milk (full fat)',         veg:1, cal:61,  pro:3.2, carb:4.8, fat:3.5, unit:'glass'},
  {name:'Milk (toned)',            veg:1, cal:46,  pro:3.5, carb:4.6, fat:1.5, unit:'glass'},
  {name:'Turmeric Milk',           veg:1, cal:140, pro:7.0, carb:14,  fat:6.0, unit:'glass'},
  {name:'Mango Lassi',             veg:1, cal:180, pro:5.0, carb:32,  fat:3.5, unit:'glass'},
  {name:'Rose Milk',               veg:1, cal:130, pro:4.0, carb:22,  fat:3.5, unit:'glass'},
  {name:'Masala Chai (milk)',      veg:1, cal:60,  pro:2.5, carb:9,   fat:1.5, unit:'cup'},
  {name:'Black Tea',               veg:1, cal:5,   pro:0,   carb:1,   fat:0,   unit:'cup'},
  {name:'Black Coffee',            veg:1, cal:5,   pro:0.3, carb:0,   fat:0,   unit:'cup'},
  {name:'Coffee with milk',        veg:1, cal:55,  pro:2.5, carb:7,   fat:2.0, unit:'cup'},
  {name:'Coconut Water',           veg:1, cal:46,  pro:1.7, carb:9,   fat:0.5, unit:'glass'},
  {name:'Nimbu Pani',              veg:1, cal:30,  pro:0.2, carb:8,   fat:0,   unit:'glass'},
  {name:'Aam Panna',               veg:1, cal:70,  pro:0.5, carb:18,  fat:0,   unit:'glass'},
  {name:'Orange Juice (fresh)',    veg:1, cal:112, pro:1.7, carb:26,  fat:0.5, unit:'glass'},
  {name:'Protein Shake (whey)',    veg:1, cal:130, pro:25,  carb:5,   fat:2.0, unit:'serving'},
  // ── Fruits ──────────────────────────────────────
  {name:'Banana',                  veg:1, cal:89,  pro:1.1, carb:23,  fat:0.3, unit:'piece'},
  {name:'Apple',                   veg:1, cal:52,  pro:0.3, carb:14,  fat:0.2, unit:'piece'},
  {name:'Mango (100g)',            veg:1, cal:60,  pro:0.8, carb:15,  fat:0.4, unit:'serving'},
  {name:'Papaya (1 cup)',          veg:1, cal:43,  pro:0.5, carb:11,  fat:0.3, unit:'cup'},
  {name:'Guava',                   veg:1, cal:68,  pro:2.6, carb:14,  fat:1.0, unit:'piece'},
  {name:'Orange',                  veg:1, cal:47,  pro:0.9, carb:12,  fat:0.1, unit:'piece'},
  {name:'Pomegranate (1 cup)',     veg:1, cal:83,  pro:1.7, carb:19,  fat:1.2, unit:'cup'},
  {name:'Watermelon (1 cup)',      veg:1, cal:30,  pro:0.6, carb:8,   fat:0.2, unit:'cup'},
  {name:'Grapes (1 cup)',          veg:1, cal:69,  pro:0.7, carb:18,  fat:0.2, unit:'cup'},
  {name:'Pear',                    veg:1, cal:57,  pro:0.4, carb:15,  fat:0.1, unit:'piece'},
  {name:'Chikoo / Sapota',         veg:1, cal:83,  pro:0.4, carb:20,  fat:1.1, unit:'piece'},
  {name:'Litchi (100g)',           veg:1, cal:66,  pro:0.8, carb:17,  fat:0.4, unit:'serving'},
  // ── Nuts & Seeds ────────────────────────────────
  {name:'Almonds (6 pieces)',      veg:1, cal:42,  pro:1.5, carb:1.5, fat:3.6, unit:'serving'},
  {name:'Walnuts (4 halves)',      veg:1, cal:65,  pro:1.5, carb:1.4, fat:6.5, unit:'serving'},
  {name:'Peanuts (roasted, tbsp)', veg:1, cal:166, pro:7.5, carb:6,   fat:14,  unit:'tbsp'},
  {name:'Cashews (10 pieces)',     veg:1, cal:55,  pro:1.5, carb:3,   fat:4.5, unit:'serving'},
  {name:'Peanut Butter',           veg:1, cal:90,  pro:4.0, carb:3,   fat:8.0, unit:'tbsp'},
  {name:'Mixed Nuts (handful)',    veg:1, cal:170, pro:5.0, carb:7,   fat:15,  unit:'serving'},
  {name:'Sunflower Seeds',         veg:1, cal:85,  pro:3.0, carb:3.5, fat:7.5, unit:'tbsp'},
  {name:'Flaxseeds',               veg:1, cal:55,  pro:1.9, carb:3,   fat:4.3, unit:'tbsp'},
  {name:'Chia Seeds',              veg:1, cal:58,  pro:2.0, carb:5,   fat:3.7, unit:'tbsp'},
  // ── Sweets & Desserts ───────────────────────────
  {name:'Gulab Jamun',             veg:1, cal:143, pro:2.0, carb:26,  fat:4.5, unit:'piece'},
  {name:'Rasgulla',                veg:1, cal:106, pro:3.5, carb:21,  fat:1.5, unit:'piece'},
  {name:'Kheer (rice)',            veg:1, cal:180, pro:5.0, carb:30,  fat:5.0, unit:'bowl'},
  {name:'Halwa (suji)',            veg:1, cal:258, pro:4.5, carb:38,  fat:10,  unit:'serving'},
  {name:'Gajar Halwa',             veg:1, cal:210, pro:4.0, carb:32,  fat:8.0, unit:'bowl'},
  {name:'Ladoo (besan)',           veg:1, cal:157, pro:3.0, carb:22,  fat:6.5, unit:'piece'},
  {name:'Ladoo (motichoor)',       veg:1, cal:140, pro:2.5, carb:23,  fat:5.0, unit:'piece'},
  {name:'Jalebi',                  veg:1, cal:150, pro:1.5, carb:32,  fat:3.0, unit:'piece'},
  {name:'Barfi (milk)',            veg:1, cal:130, pro:3.5, carb:18,  fat:5.5, unit:'piece'},
  {name:'Shrikhand',               veg:1, cal:195, pro:7.0, carb:30,  fat:5.5, unit:'bowl'},
  {name:'Kulfi',                   veg:1, cal:155, pro:4.5, carb:22,  fat:5.5, unit:'piece'},
  {name:'Ice Cream (vanilla)',     veg:1, cal:137, pro:2.5, carb:16,  fat:7.0, unit:'scoop'},
  {name:'Payasam',                 veg:1, cal:190, pro:5.5, carb:33,  fat:5.0, unit:'bowl'},
  {name:'Rabri',                   veg:1, cal:225, pro:7.0, carb:30,  fat:9.0, unit:'bowl'},
  // ═══ NON-VEGETARIAN ═══
  // ── Chicken ─────────────────────────────────────
  {name:'Chicken Breast (grilled)',veg:0, cal:165, pro:31,  carb:0,   fat:3.6, unit:'100g'},
  {name:'Chicken Thigh (grilled)', veg:0, cal:209, pro:26,  carb:0,   fat:11,  unit:'100g'},
  {name:'Chicken Curry',           veg:0, cal:250, pro:25,  carb:8,   fat:14,  unit:'bowl'},
  {name:'Butter Chicken',          veg:0, cal:290, pro:24,  carb:12,  fat:17,  unit:'bowl'},
  {name:'Chicken Tikka Masala',    veg:0, cal:280, pro:26,  carb:10,  fat:15,  unit:'bowl'},
  {name:'Chicken Tikka',           veg:0, cal:195, pro:28,  carb:5,   fat:7.5, unit:'serving'},
  {name:'Chicken Biryani',         veg:0, cal:360, pro:22,  carb:52,  fat:8.0, unit:'plate'},
  {name:'Tandoori Chicken',        veg:0, cal:185, pro:27,  carb:4,   fat:7.0, unit:'piece'},
  {name:'Chicken Kebab',           veg:0, cal:165, pro:22,  carb:5,   fat:6.5, unit:'piece'},
  {name:'Chicken Seekh Kebab',     veg:0, cal:175, pro:20,  carb:4,   fat:9.0, unit:'piece'},
  {name:'Chicken 65',              veg:0, cal:240, pro:22,  carb:10,  fat:13,  unit:'serving'},
  {name:'Chicken Lollipop',        veg:0, cal:145, pro:14,  carb:8,   fat:6.0, unit:'piece'},
  {name:'Palak Chicken',           veg:0, cal:235, pro:24,  carb:8,   fat:12,  unit:'bowl'},
  {name:'Chicken Korma',           veg:0, cal:310, pro:24,  carb:10,  fat:20,  unit:'bowl'},
  {name:'Chicken Rogan Josh',      veg:0, cal:265, pro:25,  carb:8,   fat:15,  unit:'bowl'},
  {name:'Chicken Keema',           veg:0, cal:275, pro:24,  carb:6,   fat:17,  unit:'bowl'},
  {name:'Chicken Fried Rice',      veg:0, cal:310, pro:18,  carb:42,  fat:8.0, unit:'plate'},
  {name:'Chicken Wrap',            veg:0, cal:350, pro:28,  carb:35,  fat:10,  unit:'piece'},
  {name:'Chicken Sandwich',        veg:0, cal:290, pro:22,  carb:30,  fat:9.0, unit:'piece'},
  {name:'Chicken Momos (steamed)', veg:0, cal:185, pro:15,  carb:24,  fat:4.0, unit:'serving'},
  {name:'Chicken Momos (fried)',   veg:0, cal:255, pro:15,  carb:24,  fat:11,  unit:'serving'},
  {name:'Chicken Stew',            veg:0, cal:215, pro:22,  carb:10,  fat:10,  unit:'bowl'},
  {name:'Chicken Rezala',          veg:0, cal:295, pro:23,  carb:7,   fat:19,  unit:'bowl'},
  {name:'Chicken Chettinad',       veg:0, cal:270, pro:24,  carb:9,   fat:16,  unit:'bowl'},
  {name:'Chicken Changezi',        veg:0, cal:310, pro:24,  carb:12,  fat:20,  unit:'bowl'},
  // ── Mutton & Lamb ────────────────────────────────
  {name:'Mutton Curry',            veg:0, cal:295, pro:26,  carb:5,   fat:19,  unit:'bowl'},
  {name:'Mutton Biryani',          veg:0, cal:390, pro:24,  carb:52,  fat:10,  unit:'plate'},
  {name:'Mutton Rogan Josh',       veg:0, cal:310, pro:28,  carb:6,   fat:20,  unit:'bowl'},
  {name:'Mutton Keema',            veg:0, cal:320, pro:25,  carb:5,   fat:22,  unit:'bowl'},
  {name:'Mutton Seekh Kebab',      veg:0, cal:200, pro:22,  carb:4,   fat:11,  unit:'piece'},
  {name:'Mutton Nihari',           veg:0, cal:350, pro:28,  carb:8,   fat:23,  unit:'bowl'},
  {name:'Mutton Korma',            veg:0, cal:340, pro:26,  carb:9,   fat:23,  unit:'bowl'},
  {name:'Lamb Chops (grilled)',    veg:0, cal:200, pro:23,  carb:0,   fat:12,  unit:'piece'},
  {name:'Mutton Paya',             veg:0, cal:260, pro:20,  carb:4,   fat:18,  unit:'bowl'},
  {name:'Mutton Kofta Curry',      veg:0, cal:305, pro:24,  carb:8,   fat:20,  unit:'bowl'},
  // ── Fish & Seafood ───────────────────────────────
  {name:'Fish Curry',              veg:0, cal:220, pro:24,  carb:7,   fat:11,  unit:'bowl'},
  {name:'Fish Fry',                veg:0, cal:215, pro:22,  carb:8,   fat:11,  unit:'piece'},
  {name:'Fish Tandoori',           veg:0, cal:175, pro:24,  carb:5,   fat:7.0, unit:'serving'},
  {name:'Pomfret Fry',             veg:0, cal:195, pro:22,  carb:6,   fat:10,  unit:'piece'},
  {name:'Rohu Fish Curry',         veg:0, cal:205, pro:22,  carb:6,   fat:10,  unit:'bowl'},
  {name:'Surmai / King Fish Fry',  veg:0, cal:190, pro:24,  carb:5,   fat:9.0, unit:'piece'},
  {name:'Prawn Masala',            veg:0, cal:210, pro:24,  carb:8,   fat:9.0, unit:'bowl'},
  {name:'Prawn Biryani',           veg:0, cal:340, pro:20,  carb:50,  fat:7.0, unit:'plate'},
  {name:'Prawn Fry',               veg:0, cal:185, pro:22,  carb:5,   fat:9.0, unit:'serving'},
  {name:'Crab Curry',              veg:0, cal:195, pro:22,  carb:6,   fat:9.0, unit:'bowl'},
  {name:'Tuna (canned, 100g)',     veg:0, cal:132, pro:28,  carb:0,   fat:1.5, unit:'100g'},
  {name:'Salmon (grilled, 150g)',  veg:0, cal:208, pro:28,  carb:0,   fat:10,  unit:'serving'},
  {name:'Fish Molee',              veg:0, cal:235, pro:23,  carb:6,   fat:13,  unit:'bowl'},
  {name:'Prawn Koliwada',          veg:0, cal:220, pro:22,  carb:10,  fat:11,  unit:'serving'},
  // ── Eggs ─────────────────────────────────────────
  {name:'Egg (boiled)',            veg:0, cal:78,  pro:6.3, carb:0.6, fat:5.3, unit:'piece'},
  {name:'Egg (fried)',             veg:0, cal:90,  pro:6.3, carb:0.4, fat:7.0, unit:'piece'},
  {name:'Egg Bhurji',              veg:0, cal:180, pro:13,  carb:3,   fat:13,  unit:'serving'},
  {name:'Omelette (2 eggs)',       veg:0, cal:185, pro:13,  carb:2,   fat:14,  unit:'serving'},
  {name:'Egg Curry',               veg:0, cal:215, pro:14,  carb:8,   fat:15,  unit:'bowl'},
  {name:'Egg Biryani',             veg:0, cal:330, pro:16,  carb:50,  fat:8.0, unit:'plate'},
  {name:'Egg Fried Rice',          veg:0, cal:290, pro:14,  carb:40,  fat:8.5, unit:'plate'},
  {name:'Egg Paratha',             veg:0, cal:230, pro:10,  carb:28,  fat:9.0, unit:'piece'},
  {name:'Egg Roll',                veg:0, cal:280, pro:12,  carb:34,  fat:10,  unit:'piece'},
  {name:'Egg Half Fry',            veg:0, cal:85,  pro:6.0, carb:0.4, fat:6.5, unit:'piece'},
  // ── Misc Non-Veg ─────────────────────────────────
  {name:'Keema Pav',               veg:0, cal:380, pro:22,  carb:42,  fat:13,  unit:'plate'},
  {name:'Nihari',                  veg:0, cal:330, pro:26,  carb:9,   fat:22,  unit:'bowl'},
  {name:'Haleem',                  veg:0, cal:295, pro:22,  carb:28,  fat:10,  unit:'bowl'},
  {name:'Nahari Gosht',            veg:0, cal:310, pro:25,  carb:8,   fat:20,  unit:'bowl'},
];

FOOD_DB.push(
  {name:'Egg Whites (4)',          veg:0, cal:68,  pro:14.4, carb:1.0, fat:0.2, unit:'serving'},
  {name:'Boiled Chickpeas',        veg:1, cal:164, pro:8.9,  carb:27,  fat:2.6, unit:'cup'},
  {name:'Sprouts Salad',           veg:1, cal:120, pro:9.0,  carb:20,  fat:1.0, unit:'bowl'},
  {name:'Soya Chunks (boiled)',    veg:1, cal:173, pro:26,   carb:16,  fat:0.5, unit:'cup'},
  {name:'Tofu (firm, grilled)',    veg:1, cal:144, pro:17,   carb:3,   fat:8,   unit:'100g'},
  {name:'Paneer Tikka (low oil)',  veg:1, cal:210, pro:18,   carb:6,   fat:13,  unit:'serving'},
  {name:'Low-fat Curd',            veg:1, cal:80,  pro:8.0,  carb:10,  fat:1.5, unit:'bowl'},
  {name:'Whey Isolate',            veg:1, cal:110, pro:25,   carb:1,   fat:0.5, unit:'scoop'},
  {name:'Quinoa (cooked)',         veg:1, cal:222, pro:8.1,  carb:39,  fat:3.6, unit:'cup'},
  {name:'Moong Dal Khichdi',       veg:1, cal:240, pro:11,   carb:42,  fat:4.0, unit:'bowl'},
  {name:'Grilled Chicken Breast',  veg:0, cal:248, pro:46,   carb:0,   fat:5.4, unit:'150g'},
  {name:'Tuna Salad',              veg:0, cal:190, pro:30,   carb:6,   fat:5,   unit:'bowl'}
);

// Daily targets (default, can be personalised)
const DAILY_TARGETS = {cal:2000, protein:120, carbs:250, fat:65};

let mealNutritionChart = null;

// ── Meal date navigation ──
function changeMealDay(n){state.mealDate=addDays(state.mealDate,n);renderMeals();}
function goMealToday(){state.mealDate=todayStr();renderMeals();}
function setMealType(type,btn){
  state.activeMealType=type;
  document.querySelectorAll('.meal-tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
}

// ── Food search ──
let _foodVegFilter='all'; // 'all' | 'veg' | 'nonveg'
function setFoodFilter(f,btn){
  _foodVegFilter=f;
  document.querySelectorAll('.food-filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  searchFood(document.getElementById('food-search').value);
}
function normFood(f){
  // handle both old {cal,protein,carbs,fat} and new {cal,pro,carb,fat} field names
  return { ...f,
    protein: f.protein ?? f.pro ?? 0,
    carbs:   f.carbs   ?? f.carb ?? 0,
    fat:     f.fat     ?? 0,
    veg:     f.veg     ?? 1,
  };
}
function searchFood(query){
  const box=document.getElementById('food-suggestions');
  if(!query||query.length<2){box.style.display='none';return;}
  const q=query.toLowerCase();
  const customFoods=getCustomFoods().map(f=>({...f,veg:1}));
  const allFoods=[...FOOD_DB,...customFoods];
  const filtered=allFoods.filter(f=>{
    if(!f.name.toLowerCase().includes(q)) return false;
    if(_foodVegFilter==='veg')    return f.veg===1;
    if(_foodVegFilter==='nonveg') return f.veg===0;
    return true;
  }).slice(0,12);
  if(!filtered.length){box.style.display='none';return;}
  box.style.display='block';
  window._foodResults = filtered.map(normFood);
  box.innerHTML=window._foodResults.map((f,i)=>{
    const icon=f.veg===0?'&#x1F357;':'&#x1F7E2;';
    const custom=f.custom?'<span style="font-size:10px;color:var(--teal)"> custom</span>':'';
    return '<div class="food-sug-item" onclick="selectFoodByIndex('+i+')">'
      +'<div class="food-sug-main"><span><span style="font-size:11px;margin-right:4px">'+icon+'</span>'
      +esc(f.name)+custom+'</span><span class="food-sug-unit">per '+esc(f.unit)+'</span></div>'
      +'<div class="food-sug-macros"><span class="cal">'+f.cal+' kcal</span><span>P '+(f.protein||0)+'g</span><span>C '+(f.carbs||0)+'g</span><span>F '+(f.fat||0)+'g</span></div>'
      +'</div>';
  }).join('');
}function selectFoodByIndex(i){ selectFood(window._foodResults[i]||{}); }
function selectFood(f){ f=normFood(f);
  selectedFood=f;
  document.getElementById('food-search').value=f.name;
  document.getElementById('food-unit').value=f.unit;
  document.getElementById('food-suggestions').style.display='none';
  document.getElementById('selected-food-name').textContent=f.name+' — per '+f.unit+': '+f.cal+' kcal | P:'+f.protein+'g C:'+f.carbs+'g F:'+f.fat+'g';
  updateMacroPreview();
}

function addCustomFood(){
  const name=document.getElementById('food-search').value.trim();
  if(!name){alert('type a food name first');return;}
  if(!selectedFood||selectedFood.name!==name){
    // treat as custom entry — will be analysed by AI
    selectedFood={name,cal:0,protein:0,carbs:0,fat:0,unit:document.getElementById('food-unit').value,custom:true};
    document.getElementById('selected-food-name').textContent=name+' — macros will be estimated by AI when you log';
    updateMacroPreview();
  }
}

function updateMacroPreview(){
  if(!selectedFood){
    ['cal','pro','carb','fat'].forEach(id=>document.getElementById('prev-'+id).textContent='—');
    return;
  }
  const qty=parseFloat(document.getElementById('food-qty').value)||1;
  const c=Math.round(selectedFood.cal*qty);
  const p=((selectedFood.protein||selectedFood.pro||0)*qty).toFixed(1);
  const cb=((selectedFood.carbs||selectedFood.carb||0)*qty).toFixed(1);
  const ft=((selectedFood.fat||0)*qty).toFixed(1);
  document.getElementById('prev-cal').textContent=c?c+'kcal':'?';
  document.getElementById('prev-pro').textContent=p>0?p+'g':'?';
  document.getElementById('prev-carb').textContent=cb>0?cb+'g':'?';
  document.getElementById('prev-fat').textContent=ft>0?ft+'g':'?';
}

function saveRecentFood(f){
  try{
    const key='recentFoods_'+(window._currentUser?.uid||'guest');
    let recent=JSON.parse(localStorage.getItem(key)||'[]');
    recent=recent.filter(r=>r.name!==f.name);
    recent.unshift({name:f.name,cal:f.cal,protein:f.protein||0,carbs:f.carbs||0,fat:f.fat||0,unit:f.unit,veg:f.veg??1});
    localStorage.setItem(key,JSON.stringify(recent.slice(0,8)));
  }catch(e){}
}
function getRecentFoods(){
  try{return JSON.parse(localStorage.getItem('recentFoods_'+(window._currentUser?.uid||'guest'))||'[]');}catch(e){return[];}
}
function renderRecentFoods(){
  const recent=getRecentFoods();
  const wrap=document.getElementById('recent-foods-wrap');
  const el=document.getElementById('recent-foods');
  if(!wrap||!el)return;
  if(!recent.length){wrap.style.display='none';return;}
  wrap.style.display='block';
  el.innerHTML=recent.map((f,i)=>'<span onclick="selectFood(window._recentFoods['+i+'])" style="font-size:11px;padding:3px 9px;border-radius:20px;background:var(--bg2);border:.5px solid var(--bdr);cursor:pointer;color:var(--txt2);display:inline-block;margin:2px" title="'+esc(f.name)+' — '+f.cal+' kcal/'+f.unit+'">'+esc(f.name)+'</span>').join('');
  window._recentFoods=recent.map(f=>normFood(f));
}
function logFoodEntry(){
  if(!selectedFood){alert('please select a food first');return;}
  const qty=parseFloat(document.getElementById('food-qty').value)||1;
  const d=state.mealDate;
  const loggedFoodName=selectedFood.name;
  if(!state.mealLogs[d])state.mealLogs[d]=[];
  state.mealLogs[d].push({
    id:Date.now().toString(),
    mealType:state.activeMealType,
    name:selectedFood.name,
    qty, unit:selectedFood.unit,
    cal:Math.round(selectedFood.cal*qty),
    protein:parseFloat(((selectedFood.protein||selectedFood.pro||0)*qty).toFixed(1)),
    carbs:parseFloat(((selectedFood.carbs||selectedFood.carb||0)*qty).toFixed(1)),
    fat:parseFloat(((selectedFood.fat||0)*qty).toFixed(1)),
    veg: selectedFood.veg!==undefined ? selectedFood.veg : 1,
    custom:!!selectedFood.custom,
    time:new Date().toTimeString().slice(0,5)
  });
  saveRecentFood(selectedFood);
  clearFoodSelection();
  save();
  renderMeals();
  showToast(loggedFoodName+' logged ✓');
}

function clearFoodSelection(){
  selectedFood=null;
  document.getElementById('food-search').value='';
  document.getElementById('food-suggestions').style.display='none';
  document.getElementById('food-qty').value='1';
  document.getElementById('food-unit').value='serving';
  document.getElementById('selected-food-name').textContent='';
  ['cal','pro','carb','fat'].forEach(id=>document.getElementById('prev-'+id).textContent='—');
}

function deleteMealEntry(d,id){
  if(!confirm('remove this food entry?'))return;
  state.mealLogs[d]=state.mealLogs[d].filter(e=>e.id!==id);
  save();renderMeals();
}

// ── Render meal view ──
function renderMeals(){
  const d=state.mealDate;
  const s=getSettings();
  document.getElementById('meal-date-label').textContent=fmtDate(d)+(d===todayStr()?' — today':'');
  const entries=state.mealLogs[d]||[];
  const totals=entries.reduce((acc,e)=>({cal:acc.cal+e.cal,protein:acc.protein+e.protein,carbs:acc.carbs+e.carbs,fat:acc.fat+e.fat}),{cal:0,protein:0,carbs:0,fat:0});

  renderWaterWidget();

  // Daily nutrition cards — use settings targets
  const nn=[
    {lbl:'calories',val:Math.round(totals.cal),target:s.calTarget,unit:'kcal',color:'#BA7517'},
    {lbl:'protein', val:totals.protein.toFixed(1),target:s.proteinTarget,unit:'g',color:'#1D9E75'},
    {lbl:'carbs',   val:totals.carbs.toFixed(1),  target:s.carbsTarget,  unit:'g',color:'#185FA5'},
    {lbl:'fat',     val:totals.fat.toFixed(1),    target:s.fatTarget,    unit:'g',color:'#D85A30'},
  ];
  document.getElementById('daily-nutrition').innerHTML=nn.map(n=>{
    const pct=Math.min(Math.round((n.val/n.target)*100),100);
    const over=n.val>n.target;
    return `<div class="dn-card">
      <div class="dn-label">${n.lbl}</div>
      <div class="dn-val" style="color:${over?'var(--red)':n.color}">${n.val}</div>
      <div class="dn-target">${n.unit} / ${n.target} target</div>
      <div class="dn-bar"><div class="dn-bar-fill" style="width:${pct}%;background:${over?'var(--red)':n.color}"></div></div>
    </div>`;
  }).join('');

  const mealTypes=['breakfast','lunch','snack','dinner'];
  if(mealNutritionChart){try{mealNutritionChart.destroy();}catch(e){} mealNutritionChart=null;}

  // Group entries by meal type
  const el=document.getElementById('meal-entries');
  document.getElementById('empty-meals').style.display=entries.length?'none':'block';
  if(!entries.length){el.innerHTML='';return;}

  const grouped={};
  mealTypes.forEach(mt=>{
    const es=entries.filter(e=>e.mealType===mt);
    if(es.length)grouped[mt]=es;
  });
  const mealIcon={breakfast:'ti-sunrise',lunch:'ti-sun-high',dinner:'ti-moon',snack:'ti-apple'};
  el.innerHTML=Object.entries(grouped).map(([mt,es])=>{
    const mtot=es.reduce((acc,e)=>({cal:acc.cal+e.cal,protein:acc.protein+e.protein,carbs:acc.carbs+e.carbs,fat:acc.fat+e.fat}),{cal:0,protein:0,carbs:0,fat:0});
    return `<div class="meal-entry">
      <div class="meal-entry-header">
        <span class="meal-type-badge"><i class="ti ${mealIcon[mt]||'ti-tools-kitchen-2'}"></i> ${mt.charAt(0).toUpperCase()+mt.slice(1)}</span>
        <span style="font-size:12px;color:var(--amb);font-weight:600">${Math.round(mtot.cal)} kcal</span>
      </div>
      <div class="meal-foods">
        ${es.map(e=>`
          <div class="meal-food-row">
            <div style="display:flex;align-items:center;gap:6px">
              <button onclick="deleteMealEntry('${d}','${e.id}')" style="width:20px;height:20px;border-radius:50%;border:.5px solid var(--bdr);background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0" title="remove">
                <i class="ti ti-x" style="font-size:10px;color:var(--txt3)"></i>
              </button>
              <span class="meal-food-name">${esc(e.name)} <span style="color:var(--txt3)">${e.qty} ${e.unit}</span></span>
            </div>
            <span class="meal-food-cal">${e.cal} kcal</span>
          </div>`).join('')}
      </div>
      <div class="meal-macros">
        <div class="mm"><span style="color:var(--teal)">${mtot.protein.toFixed(1)}g</span> protein</div>
        <div class="mm"><span style="color:var(--blu)">${mtot.carbs.toFixed(1)}g</span> carbs</div>
        <div class="mm"><span style="color:var(--cor)">${mtot.fat.toFixed(1)}g</span> fat</div>
      </div>
    </div>`;
  }).join('');
}

// ── AI Nutrition Analysis ──
async function runNutritionAnalysis(){
  const d=state.mealDate;
  const entries=state.mealLogs[d]||[];
  const el=document.getElementById('nutrition-ai-result');

  if(!entries.length){el.innerHTML='<div style="font-size:13px;color:var(--txt2);padding:10px 0">log some food first to get an analysis.</div>';return;}

  el.innerHTML=`<div class="ai-analyzing"><div class="dot"></div><div class="dot"></div><div class="dot"></div><span>analysing your nutrition…</span></div>`;

  const totals=entries.reduce((acc,e)=>({cal:acc.cal+e.cal,protein:acc.protein+e.protein,carbs:acc.carbs+e.carbs,fat:acc.fat+e.fat}),{cal:0,protein:0,carbs:0,fat:0});
  const mealSummary=entries.map(e=>`${e.name} (${e.qty} ${e.unit}) — ${e.cal}kcal, P:${e.protein}g, C:${e.carbs}g, F:${e.fat}g`).join('\n');

  // Also check if there are custom entries needing macro estimation
  const customItems=entries.filter(e=>e.custom&&e.cal===0);

  const prompt=`You are a certified Indian vegetarian nutrition expert. Analyse this person's food intake for the day.

DATE: ${fmtDate(d)}
FOOD LOGGED:
${mealSummary}

DAILY TOTALS:
- Calories: ${Math.round(totals.cal)} / ${DAILY_TARGETS.cal} target
- Protein: ${totals.protein.toFixed(1)}g / ${DAILY_TARGETS.protein}g target
- Carbs: ${totals.carbs.toFixed(1)}g / ${DAILY_TARGETS.carbs}g target
- Fat: ${totals.fat.toFixed(1)}g / ${DAILY_TARGETS.fat}g target

PERSON'S GOALS: Reduce body fat to 20%, active lifestyle (gym daily), busy professional

${customItems.length ? 'NOTE: Some items were manually entered without macro data — please estimate their nutrition values based on standard Indian recipes.\n' : ''}

Please provide:
1. **Nutrition Score** (out of 10) with a one-line reason
2. **What you did well** (1-2 points specific to their food)
3. **What to improve** (2-3 specific, actionable suggestions for tomorrow)
4. **Protein gap** — are they meeting their protein needs for muscle/body fat goals?
5. **One smart swap** — one specific Indian food swap to improve the day (e.g. "swap white rice with brown rice or daliya")

Keep it concise, practical, and specific to Indian vegetarian food. Max 200 words.`;

  try{
    const resp=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:600,messages:[{role:'user',content:prompt}]})
    });
    const data=await resp.json();
    const txt=data.content?.find(b=>b.type==='text')?.text||'';
    if(!txt)throw new Error('empty');
    el.innerHTML=`<div class="nutrition-result">${formatAIText(txt)}</div>`;
  }catch(e){
    el.innerHTML=`<div class="nutrition-result">${buildFallbackNutrition(totals)}</div>`;
  }
}

function buildFallbackNutrition(totals){
  const calPct=Math.round(totals.cal/DAILY_TARGETS.cal*100);
  const proPct=Math.round(totals.protein/DAILY_TARGETS.protein*100);
  let txt='<strong>Nutrition Summary</strong><br>';
  txt+=calPct>110?'⚠️ Over calorie target — consider lighter snacks tomorrow.<br>':calPct<70?'⬇️ Under-eating — make sure you hit your calorie target.<br>':'✅ Calories in a good range.<br>';
  txt+=proPct<80?`<br><strong>Protein gap:</strong> You hit only ${proPct}% of your protein target. Add a bowl of dal, curd, or paneer to each meal.<br>`:'<br>✅ Good protein intake for your goals.<br>';
  txt+='<br><strong>Smart swap:</strong> Try replacing refined grains (maida roti/naan) with whole wheat roti or multigrain roti for better fibre and satiety.';
  return txt;
}

// ═══════════════════════════════════════════════════════════════════
// SETTINGS & PROFILE
// ═══════════════════════════════════════════════════════════════════
