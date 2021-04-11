var WaveSurfer = window.WaveSurfer;
var KasiosWaveSurfer = window.WaveSurfer;
var SpectrogramPlugin = window.WaveSurfer.spectrogram;
//wavesurfer for normal recordings
var wavesurfer = WaveSurfer.create({
    container: '#waveform',
    waveColor: "rgba(255, 0, 16, 0.5)",
    progressColor: "rgba(255, 0, 16, 1)",
    barMinHeight: 0.1,
    barWidth: 2,
    barHeight: 1,
    barRadius: 1,
    barGap: null,
    normalize: true,
    responsive: true,
    hideScrollbar: true,
    plugins: [
        WaveSurfer.spectrogram.create({
            wavesurfer: wavesurfer,
            container: '#sdiv2',
            labels: true,
            fftSamples: 256,
        })
    ]
});

wavesurfer.load('Rose-Crested-Blue-Pipit-1201.wav')
//functionality for play button
d3.select('.play-button')
    .on("click", function() {
        wavesurfer.play()
    });
//functionality for pause button
d3.select('.pause-button')
    .on("click", function() {
        wavesurfer.pause()
    });
//wavesurfer for kasios
var kasios_wavesurfer = KasiosWaveSurfer.create({
    container: '#kasios-waveform',
    waveColor: 'darkgray',
    progressColor: 'black',
    barMinHeight: 0.1,
    barWidth: 2,
    barHeight: 1,
    barRadius: 1,
    normalize: true,
    responsive: true,
    hideScrollbar: true,
    plugins: [
        KasiosWaveSurfer.spectrogram.create({
            wavesurfer: wavesurfer,
            container: '#ksdiv2',
            labels: true,
            fftSamples: 256,
        })
    ]
});

kasios_wavesurfer.load('Kasios_WAV/1.wav')
//kasios buttons same as above
d3.select('#kasios-play-button')
    .on("click", function() {
        kasios_wavesurfer.play()
    });
d3.select('#kasios-pause-button')
    .on("click", function() {
        kasios_wavesurfer.pause()
    });