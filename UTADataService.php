<?php
$route=$_GET["route"];
$callback=$_GET["jsoncallback"];

$cacheDir = "./cache/";

if ($route != "701" && $route != "703" && $route != "704")
	return;

if (file_exists($cacheDir.$route) && (filemtime($cacheDir.$route) > (time() - 5))) {
	$cacheFileHandle = fopen($cacheDir.$route, "r");
	$json = fread($cacheFileHandle, filesize($cacheDir.$route));
}
else {
	$utaUrl = "http://api.rideuta.com/SIRI/SIRI.svc/VehicleMonitor/ByRoute?route=" . 
		$route . "&onwardcalls=false&usertoken=XXXXXXXXXXX";
	$ch = curl_init($utaUrl);

	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

	$buffer = curl_exec($ch);

	$xml = simplexml_load_string($buffer);

	$json = json_encode($xml->VehicleMonitoringDelivery->VehicleActivity);

	$fileHandle = fopen("cache/" . $route, "w");
	fwrite($fileHandle, $json);
	fclose($fileHandle);

	curl_close($ch);
}

echo $callback . "(" . $json . ")";
?>