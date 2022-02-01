var main_tree = `
<div id="main-learn">
<div class="d-flex flex-row justify-content-between pt-1">
<p class="lead">
<b>Ready to learn?</b>
</p>
<button type="button" class="btn-close" aria-label="Close" data-bs-toggle="collapse"
data-bs-target="#learn" aria-expanded="false" aria-controls="learn">
</button>
</div>
<ul class="list-group pb-2">
<li id="ch1" class="list-group-item list-group-item-action" style="cursor: pointer;">
<i class="pe-3 bi bi-question-square"></i>Which piano to choose?
</li>
<script>
$('#learn').on('click', '#ch1', whichBuy);
</script>
<li id="ch2" class="list-group-item list-group-item-action" style="cursor: pointer;">
<i class="pe-3 bi bi-vector-pen"></i>Proper piano technique
</li>
<li id="ch3" class="list-group-item list-group-item-action" style="cursor: pointer;">
<i class="pe-3 bi bi-music-note"></i>Starting to play
</li>
<li id="ch4" class="list-group-item list-group-item-action" style="cursor: pointer;">
<i class="pe-3 bi bi-music-note-list"></i>Reading basic piano sheets
</li>
<li id="ch5" class="list-group-item list-group-item-action" style="cursor: pointer;">
<i class="pe-3 bi bi-music-note-beamed"></i>Notes, timing and dynamics
</li>
<li id="ch6" class="list-group-item list-group-item-action" style="cursor: pointer;">
<i class="pe-3 bi bi-mortarboard-fill"></i>Learn a song!
</li>
<li id="ch7" class="list-group-item list-group-item-action" style="cursor: pointer;">
<i class="pe-3 bi bi-arrow-repeat"></i>Practice
</li>
</ul>
</div>
`;

var which_buy = `
<div id="main-learn" class="p-1">
<div class="d-flex flex-row justify-content-between">
<p class="lead">
<button class="btn p-0 m-0" type="button" id="learn_back">
<h4>
<i class=" bi bi-arrow-90deg-up"></i>
</h4>
</button>
<script>
$('#learn').on('click', '#learn_back', goHome);
</script>
<i class="px-2 bi bi-question-square"></i>
<b>Which piano to choose?</b>
</p>
<button type="button" class="btn-close" aria-label="Close" data-bs-toggle="collapse"
data-bs-target="#learn" aria-expanded="false" aria-controls="learn">
</button>
</div>
<div class="accordion" id="decidePianoAccordion">
<div class="accordion-item">
<h2 class="accordion-header" id="headingOne">
<button class="accordion-button" type="button" data-bs-toggle="collapse"
data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
Digital keyboards
</button>
</h2>
<div id="collapseOne" class="accordion-collapse collapse show"
aria-labelledby="headingOne" data-bs-parent="#decidePianoAccordion">
<div class="accordion-body">
<div class="row">
<p class="lead col pb-2">
The cheapest, most convenient, and most versatile. Sound and feel aren't
as good as acoustic pianos, but keyboards work
well as a first instrument.
</p>
</div>
<div class="row">
<div class="col">
<h5 class="">Pros</h5>
<ol>
<li>
<h6>Cost</h6>
<p>
Most digital keyboards will cost you between 100€ and 500€,
so this is the best option if you're on a budget.
</p>
</li>
<li>
<h6>Portability</h6>
<p>
Moving it for performances or just around the house is easy
enough, because they're compact and relatively light.
</p>
</li>
<li>
<h6>Headphone jack</h6>
<p>
Most of digital keyboards and pianos have a headphone jack,
so you don't need to
worry about disturbing anyone.
</p>
</li>
<li>
<h6>Size</h6>
<p>
They usually fit on your table, so there is no need to worry
if you live in a smaller flat. It is recommended to play on
a stand, which will ensure the correct height.
</p>
</li>
</ol>
</div>
<div class="col">
<h5 class="">Cons</h5>
<ol>
<li>
<h6>Sound quality</h6>
<p>
Because the sounds are usually synthesized or sampled, it
sounds less realistic.
</p>
</li>
<li>
<h6>Number of keys</h6>
<p>
Be sure to buy a full-size piano keyboard which has 88 keys
or at least 76 keys. If you go even smaller, 61 keys is the
lowest limit, since it was a standard in 1700s, but it will
still limit you from playing many modern pieces.
</p>
</li>
<li>
<h6>Key action</h6>
<p>
There are different mechanisms under the keys. Cheaper
digital keyboards and pianos don't feel as natural as an
acoustic piano. Make sure to give the keyboard a try before
buying it. Here you can se the
<a tabindex="0" class="btn-link" role="button"
data-bs-toggle="popover" data-bs-trigger="focus"
title="Hammer Action"
data-bs-content="The highest quality and most expensive. Each key moves a mechanical hammer, giving an almost identical feel to an acoustic piano.">Hammer,
</a>
<a tabindex="0" class="btn-link" role="button"
data-bs-toggle="popover" data-bs-trigger="focus"
title="Weighted Action"
data-bs-content="Weights are built into the keys, similar feel to a real piano.">Weighted,
</a>
<a tabindex="0" class="btn-link" role="button"
data-bs-toggle="popover" data-bs-trigger="focus"
title="Semi-Weighted Action"
data-bs-content="Combines spring-loaded action with weights attached to the keys. Some dynamic lost, okay for a first instrument..">
Semi-Weighted </a>
and
<a tabindex="0" class="btn-link" role="button"
data-bs-toggle="popover" data-bs-trigger="focus"
title="Unweighted Action"
data-bs-content="Typically moulded plastic keys creating resistance with springs. The cheapest option, also found on many synthesizers.">Unweighted
Action</a>.
</p>
</li>
</ol>
</div>
</div>
</div>
</div>
</div>
<div class="accordion-item">
<h2 class="accordion-header" id="headingTwo">
<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
Digital pianos
</button>
</h2>
<div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo"
data-bs-parent="#decidePianoAccordion">
<div class="accordion-body">

<div class="row">
<p class="lead col pb-2">
Larger and more expensive, but nearly as versatile while mimicking the
feel of an acoustic piano well. A great
alternative if budget and space allows.
</p>
</div>
<div class="row">
<div class="col">
<h5 class="">Pros</h5>
<ol>
<li>
<h6>Premium feel</h6>
<p>
Digital pianos are beginning to feel more and more like
acoustic pianos. They usually have <a tabindex="0"
class="btn-link" role="button" data-bs-toggle="popover"
data-bs-trigger="focus" title="Hammer Action Mechanism"
data-bs-content="Each key moves a mechanical hammer, giving an almost identical feel to an acoustic piano.">hammer
action keys</a>, and are made out of wood.
</p>
</li>
<li>
<h6>No maintenance needed</h6>
<p>
Your piano is never out of tune, so once you buy an electric
piano, you won't need to pay more money for tuning it.
</p>
</li>
<li>
<h6>MIDI</h6>
<p>
Digital keyboards and pianos will almost always have a USB
MIDI connection, allowing you to connect a computer or
portable device. This allows you to use apps and other
programs like ragtime, to access more
sounds or record your playing.
</p>
</li>
</ol>
</div>
<div class="col">
<h5 class="">Cons</h5>
<ol>
<li>
<h6>Portability</h6>
<p>
Digital pianos take up as much space as an digital
keyboards, which is good for moving it around the room. But
it has to be disassembled and reassembled if you want to
take it with you somewhere.
</p>
</li>
</ol>
</div>
</div>

</div>
</div>
</div>
<div class="accordion-item">
<h2 class="accordion-header" id="headingThree">
<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
data-bs-target="#collapseThree" aria-expanded="false"
aria-controls="collapseThree">
Acoustic pianos
</button>
</h2>
<div id="collapseThree" class="accordion-collapse collapse"
aria-labelledby="headingThree" data-bs-parent="#decidePianoAccordion">
<div class="accordion-body">

<div class="row">
<p class="lead col pb-2">
The best option for playing experience and sound quality, but by far the
largest and can be extremely expensive.
</p>
</div>
<div class="row">
<div class="col">
<h5 class="">Pros</h5>
<ol>
<li>
<h6>Acoustic sound</h6>
<p>
The original sound and playing experience that has shaped
Western music for centuries. As you play, you can feel the
notes resonate up through your fingers and around the room.
This “acoustic” sound is created with entirely physical
parts, so no electronics, sampling, or loudspeakers are
involved.
</p>
</li>
<li>
<h6>Renting a practice room</h6>
<p>
Buying an acoustic piano for home use isn't practical, so
you should enroll for piano lessons at a music school or
rent a practice room.
</p>
</li>
</ol>
</div>
<div class="col">
<h5 class="">Cons</h5>
<ol>
<li>
<h6>Cost</h6>
<p>
Not only they are the most expensive, but moving and
maintaining the piano won't come cheap.
</p>
</li>
<li>
<h6>Positioning</h6>
<p>
When buying an acoustic piano you've got to have in mind
where you will put it. Practicing may disturb your
neighbors, and if kept in dry conditions or too close to a
radiator, it can easily warp and go out of tune.
</p>
</li>
</ol>
</div>
</div>
</div>
</div>
</div>
</div>

<div class="accordion-item">
<h2 class="accordion-header" id="headingFour">
<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
data-bs-target="#collapseFour" aria-expanded="false" aria-controls="collapseFour">
Accessories
</button>
</h2>
<div id="collapseFour" class="accordion-collapse collapse" aria-labelledby="headingFour"
data-bs-parent="#decidePianoAccordion">
<div class="accordion-body">

<ul>
<li>
<h6>
Bench/stool
</h6>
<p>
Forget the keyboard players you see standing up. As a pianist, it is
best to sit at the piano, and a bench or stool set
at the correct height is essential. Larger, heavier stools remain
comfortable for longer, but are generally more
expensive. Make sure it is adjustable so you can set the height to allow
for correct posture and sitting position.
</p>
</li>
<li>
<h6>
Metronome (optional)
</h6>
<p>
A metronome provides an audible sound (usually a click or a beep) to
keep you in time with the tempo set by you.
You don't necessarily need one, but it can help at the start if you find
yourself slowing down or speeding up. Be
careful not to get into the habit of always listening for a count, as it
often makes it harder to keep time without it.
Most keyboards and digital pianos have a built-in metronome, but if you
go for an acoustic piano and need one, there are
plenty of apps available online, most of them for free.
</p>
</li>
</ul>

</div>
</div>
</div>
</div>
`;

function whichBuy() {
	$('#learn_swap').empty();
	$('#learn_swap').append(which_buy);
	enablePopovers();
}

function goHome() {
	$('#learn_swap').empty();
	$('#learn_swap').append(main_tree);
}

$('#learn_swap').append(main_tree);