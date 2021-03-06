app.controller('newGraphCtrl', function ($scope, $q, WidgetSettingsFactory, GeneratorFactory, validGraphFactory, DashboardFactory, $uibModalInstance, $interval, $timeout) {

	let data;
    $scope.getKeysAndTypes = function () {
		DashboardFactory.getDataSource($scope.form.dataSource)
		.then(DashboardFactory.findDataToGraph)
		.then(function (realData) {
           data = realData
           return validGraphFactory.getKeysAndTypes (realData)
        })
		.then(function (keysAndTypes) {
			$scope.keyTypePairs = keysAndTypes
		})
	};

    function returnGraphOptions (type, xparam, yparam) {
        return GeneratorFactory[type].options(xparam, yparam)
    }

    function addWidgetToDashboard () {
        return $scope.dashboard.charts.push({
            name: "New Widget",
            sizeX: 4,
            sizeY: 4
        })
    }

    function customExtend (widget, form) {
        angular.extend(widget, form);
        if(widget.xparam) widget.xparam = widget.xparam.name;
        if(widget.yparam) widget.yparam = widget.yparam.name;
        return widget;
    }
    $scope.dismiss = function() {
        $uibModalInstance.dismiss();
    };

    $scope.showValidGraphs = function () {
    	let xtype = null;
        let ytype = null;
        if(!!$scope.form.xparam) {
            xtype = $scope.form.xparam.type
        }
    	if(!!$scope.form.yparam) {
    		ytype = $scope.form.yparam.type
    	}
    	$scope.validGraphTypes = validGraphFactory
            .getValidGraphTypes (xtype, ytype)
            .map(function (type) {
                let fakeWidget = {
                    type: type,
                    xparam: $scope.form.xparam? $scope.form.xparam.name : null,
                    yparam: $scope.form.yparam? $scope.form.yparam.name : null
                }

                return {
                    name: type,
                    options: returnGraphOptions(type, fakeWidget.xparam, fakeWidget.yparam),
                    data: DashboardFactory.setDataInCorrectFormat(data, fakeWidget)
                }
            })
    }

    $scope.build = function () {
        let numberOfCharts = addWidgetToDashboard()

        let widget = $scope.dashboard.charts[numberOfCharts -1]
        widget = customExtend(widget, $scope.form);

        WidgetSettingsFactory.newSetKeys($scope.form.dataSource, widget)
        .then(function (dataArr) {

            widget.chart.api.updateWithData(dataArr[0])
            widget.chart.api.updateWithOptions(returnGraphOptions(widget.type, widget.xparam, widget.yparam));
            let time = Number($scope.form.refreshInterval) * 1000
            if(!time){
                time = 10000000;
            }else if( time< 3000){
                time = 3000
            }
            widget.refreshInterval = time;
            WidgetSettingsFactory.startTicking(widget);
            return widget;
        });       
        $uibModalInstance.dismiss();

    }

})
