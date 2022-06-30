const express = require('express');
const app = express();

app.use('/main', express.static(__dirname + '/main'));


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Сервер запущен, ' + PORT);
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + ' /main /index.html');
});

app.get('/card/:id', (req, res) => {
  if (req.params.id == 'new')
    res.sendFile(__dirname + ' /main /new.html');
  else
    res.sendFile(__dirname + ' /main /index_card.html');
});

app.get('/find', (req, res) => {
  res.sendFile(__dirname + ' /main /find.html');
});

app.get('/card_edit/:id', (req, res) => {
  res.sendFile(__dirname + ' /main /edit.html');
});

app.get('/all_data', (req, res) => {
  let r = GetAllTheData();
  r.then(res_main => { res.send(JSON.stringify(res_main)) });
});

app.get('/card_fe/:id', (req, res) => {
  let r = GetCardForEdit(req.params.id);
  r.then(res_main => res.send(`{"data":` + JSON.stringify(res_main) + "}"));
});

const jsonParser = express.json();
app.post('/card/:id', jsonParser, (req, res) => {
  if (req.params.id == 'new') {
    let r = AddCard(req.body);
    r.then(res_main => res.send(`{"status":"0"}`));
  }
  else {
    if (req.params.id == 'find') {
      //console.log(req.body);
      let r = FindAllCards(req.body);
      r.then(res_main => res.send(`{"data":` + JSON.stringify(res_main) + "}"));
    }
    else {
      let r = GetCard(req.params.id);
      r.then(res_main => res.send(`{"data":` + JSON.stringify(res_main) + "}"));
    }
  }
});

app.put('/card/:id', jsonParser, (req, res) => {
  let r = ChangeCard(req.body);
  r.then(res_main => res.send(`{"status":"0"}`));
});

app.delete('/card/:id', (req, res) => {
  let r = DeleteCard(req.params.id);
  r.then(res_main => res.send(`{"status":"0"}`));
});

supb = require('@supabase/supabase-js');

const supabaseUrl = 'https://yiyqsrpsalvozpvjsfxm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpeXFzcnBzYWx2b3pwdmpzZnhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTU3MjM4NDcsImV4cCI6MTk3MTI5OTg0N30.60qE6w84VKX3ci4gfRWTz7wQm-1j7EYtjYJYE18EzOI'
const supabase = supb.createClient(supabaseUrl, supabaseKey)

app.get('/all', (req, res) => {
  let r = GetCards();
  r.then(resss =>
    res.send(`{"data":` + JSON.stringify(resss) + `}`));
});

GetCard = async function (id) {
  let { data: Card, error } = await supabase
    .from('Detail')
    .select(`*,
    TechParams_Link (*,
      GermClass_Link (Word, GOST_Link(Name)),
      WorkEnv_Link (Name),
      TubeConn_Link (Name, GOST_Link(Name))
    ),
    Manufacturer_Link (PlantName, Index),
    Electronic_Link (*,
      Provod_Link (Name),
      SecureN_Link (Name)
      ),
    Sizes_Link (*),
    AsmMats_Link (
      MM1_Korpus (*, Manufacturer_ID (PlantName, Index), GOST_ID (Name)),
      MM2_Kryshka (*, Manufacturer_ID (PlantName, Index), GOST_ID (Name)),
      MM3_Salnik (*, Manufacturer_ID (PlantName, Index), GOST_ID (Name)),
      MM4_Shpindel (*, Manufacturer_ID (PlantName, Index), GOST_ID (Name)),
      MM5_Zatvor (*, Manufacturer_ID (PlantName, Index), GOST_ID (Name)),
      MM6_Klin (*, Manufacturer_ID (PlantName, Index), GOST_ID (Name)),
      MM7_Nabivka (*, Manufacturer_ID (PlantName, Index), GOST_ID (Name)),
      MM8_Prokladka (*, Manufacturer_ID (PlantName, Index), GOST_ID (Name)),
      MM9_Flancy (*, Manufacturer_ID (PlantName, Index), GOST_ID (Name))
    )`)
    .eq('id', id);
  return Card;
}

FindAllCards = async function (params) {
  const { data: Result, error } = await supabase
    .from('Detail')
    .select(`*,
  TechParams_Link (*),
  Manufacturer_Link,
  Sizes_Link (*),
  AsmMats_Link (*)
  Electronic_Link (*),
  `)
  .eq('Type', 1);
  let res1 = Result;
  let nm = params.NameL.toLowerCase();
  let ds = params.Desc.toLowerCase();
  //console.log(res1);
  if (params.NameL != "") res1 = res1.filter(x => (x.Label.toLowerCase().indexOf(nm) >= 0));
  //console.log(res1);
  if (params.Desc != "") res1 = res1.filter(x => (x.Desc.toLowerCase().indexOf(ds) >= 0));
  if (params.OKP != "") res1 = res1.filter(x => x.OKP == params.OKP);
  if (params.Manufact != "") res1 = res1.filter(x => x.Manufacturer_Link == params.Manufact);
  if (params.Mass1 != "") res1 = res1.filter(x => x.mass >= params.Mass1);
  if (params.Mass2 != "") res1 = res1.filter(x => x.mass <= params.Mass2);
  
  if (params.Prss1 != "") res1 = res1.filter(x => x.TechParams_Link.Pressure >= params.Prss1);
  if (params.Prss2 != "") res1 = res1.filter(x => x.TechParams_Link.Pressure <= params.Prss2);
  if (params.Tmin1 != "") res1 = res1.filter(x => x.TechParams_Link.Tmin >= params.Tmin1);
  if (params.Tmin2 != "") res1 = res1.filter(x => x.TechParams_Link.Tmin <= params.Tmin2);
  if (params.Tnorm1 != "") res1 = res1.filter(x => x.TechParams_Link.Tnorm >= params.Tnorm1);
  if (params.Tnorm2 != "") res1 = res1.filter(x => x.TechParams_Link.Tnorm <= params.Tnorm2);
  if (params.Tmax1 != "") res1 = res1.filter(x => x.TechParams_Link.Tmax >= params.Tmax1);
  if (params.Tmax2 != "") res1 = res1.filter(x => x.TechParams_Link.Tmax <= params.Tmax2);

  if (params.Germ != "") res1 = res1.filter(x => x.TechParams_Link.GermClass_Link == params.Germ);
  if (params.Work != "") res1 = res1.filter(x => x.TechParams_Link.WorkEnv_Link == params.Work);
  if (params.Conn != "") res1 = res1.filter(x => x.TechParams_Link.TubeConn_Link == params.Conn);
  
  if (params.DN_1 != "") res1 = res1.filter(x => x.Sizes_Link.DN >= params.DN_1);
  if (params.DN_2 != "") res1 = res1.filter(x => x.Sizes_Link.DN <= params.DN_2);
  if (params.D_1 != "") res1 = res1.filter(x => x.Sizes_Link.D >= params.D_1);
  if (params.D_2 != "") res1 = res1.filter(x => x.Sizes_Link.D <= params.D_2);
  if (params.D1_1 != "") res1 = res1.filter(x => x.Sizes_Link.D1 >= params.D1_1);
  if (params.D1_2 != "") res1 = res1.filter(x => x.Sizes_Link.D1 <= params.D1_2);
  if (params.D2_1 != "") res1 = res1.filter(x => x.Sizes_Link.D2 >= params.D2_1);
  if (params.D2_2 != "") res1 = res1.filter(x => x.Sizes_Link.D2 <= params.D2_2);
  if (params.n1 != "") res1 = res1.filter(x => x.Sizes_Link.n >= params.n1);
  if (params.n2 != "") res1 = res1.filter(x => x.Sizes_Link.n <= params.n2);
  if (params.d1 != "") res1 = res1.filter(x => x.Sizes_Link.d >= params.d1);
  if (params.d2 != "") res1 = res1.filter(x => x.Sizes_Link.d <= params.d2);
  if (params.D0_1 != "") res1 = res1.filter(x => x.Sizes_Link.D0 >= params.D0_1);
  if (params.D0_2 != "") res1 = res1.filter(x => x.Sizes_Link.D0 <= params.D0_2);
  if (params.L1 != "") res1 = res1.filter(x => x.Sizes_Link.L >= params.L1);
  if (params.L2 != "") res1 = res1.filter(x => x.Sizes_Link.L <= params.L2);
  if (params.H1 != "") res1 = res1.filter(x => x.Sizes_Link.H >= params.H1);
  if (params.H2 != "") res1 = res1.filter(x => x.Sizes_Link.H <= params.H2);
  if (params.H11 != "") res1 = res1.filter(x => x.Sizes_Link.H >= params.H11);
  if (params.H12 != "") res1 = res1.filter(x => x.Sizes_Link.H <= params.H12);

  if (params.MM1 != "null") res1 = res1.filter(x => x.AsmMats_Link.MM1_Korpus == params.MM1);
  if (params.MM2 != "null") res1 = res1.filter(x => x.AsmMats_Link.MM2_Kryshka == params.MM2);
  if (params.MM3 != "null") res1 = res1.filter(x => x.AsmMats_Link.MM3_Salnik == params.MM3);
  if (params.MM4 != "null") res1 = res1.filter(x => x.AsmMats_Link.MM4_Shpindel == params.MM4);
  if (params.MM5 != "null") res1 = res1.filter(x => x.AsmMats_Link.MM5_Zatvor == params.MM5);
  if (params.MM6 != "null") res1 = res1.filter(x => x.AsmMats_Link.MM6_Klin == params.MM6);
  if (params.MM7 != "null") res1 = res1.filter(x => x.AsmMats_Link.MM7_Nabivka == params.MM7);
  if (params.MM8 != "null") res1 = res1.filter(x => x.AsmMats_Link.MM8_Prokladka == params.MM8);
  if (params.MM9 != "null") res1 = res1.filter(x => x.AsmMats_Link.MM9_Flancy == params.MM9);

  if (params.Provod != "") res1 = res1.filter(x => x.Electronic_Link.Provod_Link == params.Provod);
  if (params.Secure != "") res1 = res1.filter(x => x.Electronic_Link.SecureN_Link == params.Secure);

  if (params.Power1 != "") res1 = res1.filter(x => x.Electronic_Link.Provod_Link >= params.Power1);
  if (params.Frequency1 != "") res1 = res1.filter(x => x.Electronic_Link.Provod_Link >= params.Frequency1);
  if (params.VoltageMIN1 != "") res1 = res1.filter(x => x.Electronic_Link.Provod_Link >= params.VoltageMIN1);
  if (params.VoltageMAX1 != "") res1 = res1.filter(x => x.Electronic_Link.Provod_Link >= params.VoltageMAX1);
  if (params.Power2 != "") res1 = res1.filter(x => x.Electronic_Link.Provod_Link <= params.Power2);
  if (params.Frequency2 != "") res1 = res1.filter(x => x.Electronic_Link.Provod_Link <= params.Frequency2);
  if (params.VoltageMIN2 != "") res1 = res1.filter(x => x.Electronic_Link.Provod_Link <= params.VoltageMIN2);
  if (params.VoltageMAX2 != "") res1 = res1.filter(x => x.Electronic_Link.Provod_Link <= params.VoltageMAX2);
  console.log(params);
  return res1;
}

GetCardForEdit = async function (id) {
  let { data: Card, error } = await supabase
    .from('Detail')
    .select(`*,
    TechParams_Link (*),
    Manufacturer_Link,
    Sizes_Link (*),
    Electronic_Link (*),
    AsmMats_Link (
      MM1_Korpus,
      MM2_Kryshka,
      MM3_Salnik,
      MM4_Shpindel,
      MM5_Zatvor,
      MM6_Klin,
      MM7_Nabivka,
      MM8_Prokladka,
      MM9_Flancy
    )`)
    .eq('id', id);
  return Card;
}

GetAllTheData = async function () {
  let { data: GermClasses, error } = await supabase
    .from('GermClasses')
    .select('*, GOST_Link(Name)');
  let { data: Mats, error2 } = await supabase
    .from('Materials')
    .select('*, Manufacturer_ID (PlantName, Index), GOST_ID (Name)');
  let { data: WorkEnv, error3 } = await supabase
    .from('WorkEnviroments')
    .select('*');
  let { data: TubeConn, error4 } = await supabase
    .from('TubeConn')
    .select('*, GOST_Link(Name)');
  let { data: Manuf, error5 } = await supabase
    .from('Manufacturer')
    .select('*');
    let { data: GOST, error6 } = await supabase
      .from('GOSTs')
      .select('*');
  return { germ: GermClasses, mats: Mats, work: WorkEnv, tube: TubeConn, manuf: Manuf, gost: GOST };
}

GetCards = async function () {
  let { data: Card, error } = await supabase
    .from('Detail')
    .select(`id, Label, Desc`);
  return Card;
}

Nullor = function (str){
  return str == "" ? null : str;
}

AddCard = async function (params) {
  let resp1 = await supabase.from('TechParams').insert([{
    Pressure: Nullor(params.Prss),
    Tmin: Nullor(params.Tmin),
    Tnorm: Nullor(params.Tnorm),
    Tmax: Nullor(params.Tmax),
    GermClass_Link: Nullor(params.Germ),
    WorkEnv_Link: Nullor(params.Work),
    TubeConn_Link: Nullor(params.Conn)
  }]);

  console.log("ответ 1: " + JSON.stringify(resp1) + "\n");
  let resp2 = await supabase.from('Sizes').insert([{
    DN: Nullor(params.DN),
    D: Nullor(params.D),
    D1: Nullor(params.D1),
    D2: Nullor(params.D2),
    n: Nullor(params.n),
    d: Nullor(params.d),
    D0: Nullor(params.D0),
    L: Nullor(params.L),
    H: Nullor(params.H),
    H1: Nullor(params.H1)
  }]);

  console.log("ответ 2: " + JSON.stringify(resp2) + "\n");
  let resp3 = await supabase.from('AssembleMats').insert([{
    MM1_Korpus: (params.MM1 != "null" ? params.MM1 : null),
    MM2_Kryshka: (params.MM2 != "null" ? params.MM2 : null),
    MM3_Salnik: (params.MM3 != "null" ? params.MM3 : null),
    MM4_Shpindel: (params.MM4 != "null" ? params.MM4 : null),
    MM5_Zatvor: (params.MM5 != "null" ? params.MM5 : null),
    MM6_Klin: (params.MM6 != "null" ? params.MM6 : null),
    MM7_Nabivka: (params.MM7 != "null" ? params.MM7 : null),
    MM8_Prokladka: (params.MM8 != "null" ? params.MM8 : null),
    MM9_Flancy: (params.MM9 != "null" ? params.MM9 : null),
  }]);
  console.log("ответ 3: " + JSON.stringify(resp3) + "\n");

  let resp4 = await supabase.from('Electronic').insert([{
    Provod_Link: Nullor(params.Provod),
    SecureN_Link: Nullor(params.Secure),
    Power: Nullor(params.Power),
    Frequency: Nullor(params.Frequency),
    VoltageMIN: Nullor(params.VoltageMIN),
    VoltageMAX: Nullor(params.VoltageMAX)
  }]);
  console.log("ответ 4: " + JSON.stringify(resp4) + "\n");

  await supabase.from('Detail').insert([{
    Label: Nullor(params.NameL),
    Desc: Nullor(params.Desc),
    OKP: Nullor(params.OKP),
    Manufacturer_Link: Nullor(params.Manufact),
    mass: Nullor(params.Mass),
    TechParams_Link: resp1.data != null ? resp1.data[0].id : null,
    Sizes_Link: resp2.data != null ? resp2.data[0].id : null,
    AsmMats_Link: resp3.data != null ? resp3.data[0].id : null,
    Electronic_Link: resp4.data != null ? resp4.data[0].id : null,
    Type: 1
  }])
}

ChangeCard = async function (params) {
  let resp = await supabase.from('Detail').update({
    Label: Nullor(params.NameL),
    Desc: Nullor(params.Desc),
    OKP: Nullor(params.OKP),
    Manufacturer_Link: Nullor(params.Manufact),
    Electronic_Link: Nullor(params.Electro),
    mass: Nullor(params.Mass)
  }).eq('id', params.id);
  await supabase.from('TechParams').update({
    Pressure: Nullor(params.Prss),
    Tmin: Nullor(params.Tmin),
    Tnorm: Nullor(params.Tnorm),
    Tmax: Nullor(params.Tmax),
    GermClass_Link: Nullor(params.Germ),
    WorkEnv_Link: Nullor(params.Work),
    TubeConn_Link: Nullor(params.Conn)
  }).eq('id', resp.data[0].TechParams_Link);
  await supabase.from('Sizes').update({
    DN: Nullor(params.DN),
    D: Nullor(params.D),
    D1: Nullor(params.D1),
    D2: Nullor(params.D2),
    n: Nullor(params.n),
    d: Nullor(params.d),
    D0: Nullor(params.D0),
    L: Nullor(params.L),
    H: Nullor(params.H),
    H1: Nullor(params.H1)
  }).eq('id', resp.data[0].Sizes_Link);
  await supabase.from('AssembleMats').update({
    MM1_Korpus: (params.MM1 != "null" ? params.MM1 : null),
    MM2_Kryshka: (params.MM2 != "null" ? params.MM2 : null),
    MM3_Salnik: (params.MM3 != "null" ? params.MM3 : null),
    MM4_Shpindel: (params.MM4 != "null" ? params.MM4 : null),
    MM5_Zatvor: (params.MM5 != "null" ? params.MM5 : null),
    MM6_Klin: (params.MM6 != "null" ? params.MM6 : null),
    MM7_Nabivka: (params.MM7 != "null" ? params.MM7 : null),
    MM8_Prokladka: (params.MM8 != "null" ? params.MM8 : null),
    MM9_Flancy: (params.MM9 != "null" ? params.MM9 : null),
  }).eq('id', resp.data[0].AsmMats_Link);
  await supabase.from('Electronic').update({
    Provod_Link: Nullor(params.Provod),
    SecureN_Link: Nullor(params.Secure),
    Power: Nullor(params.Power),
    Frequency: Nullor(params.Frequency),
    VoltageMIN: Nullor(params.VoltageMIN),
    VoltageMAX: Nullor(params.VoltageMAX)
  }).eq('id', resp.data[0].Electronic_Link);
}

DeleteCard = async function (id) {
  let resp = await supabase.from('Detail').delete().eq('id', id);
  await supabase.from('TechParams').delete().eq('id', resp.data[0].TechParams_Link);
  await supabase.from('Sizes').delete().eq('id', resp.data[0].Sizes_Link);
  await supabase.from('AssembleMats').delete().eq('id', resp.data[0].AsmMats_Link);
  await supabase.from('Electronic').delete().eq('id', resp.data[0].Electronic_Link);
}